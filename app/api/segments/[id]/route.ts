import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateSegmentSchema = z.object({
    subscriberIds: z.array(z.string()),
})

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const segment = await db.segment.findFirst({
            where: {
                id: id,
                website: { userId: session.user.id },
            },
            include: {
                subscribers: {
                    include: {
                        subscriber: true,
                    },
                },
            },
        })

        if (!segment) {
            return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
        }

        return NextResponse.json({ segment })
    } catch (error) {
        console.error('Error fetching segment:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const validatedData = updateSegmentSchema.parse(body)

        const segment = await db.segment.findFirst({
            where: {
                id: id,
                website: { userId: session.user.id },
            },
        })

        if (!segment) {
            return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
        }

        // Remove all existing subscribers
        await db.subscriberSegment.deleteMany({
            where: { segmentId: id },
        })

        // Add new subscribers
        if (validatedData.subscriberIds.length > 0) {
            await db.subscriberSegment.createMany({
                data: validatedData.subscriberIds.map(subscriberId => ({
                    segmentId: id,
                    subscriberId,
                })),
                skipDuplicates: true,
            })
        }

        return NextResponse.json({ message: 'Segment updated successfully' })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
        }

        console.error('Error updating segment:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const segment = await db.segment.findFirst({
            where: {
                id: id,
                website: { userId: session.user.id },
            },
        })

        if (!segment) {
            return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
        }

        await db.segment.delete({
            where: { id: id },
        })

        return NextResponse.json({ message: 'Segment deleted successfully' })
    } catch (error) {
        console.error('Error deleting segment:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
