import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const segmentSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    websiteId: z.string(),
    subscriberIds: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const websiteId = searchParams.get('websiteId')

        if (!websiteId) {
            return NextResponse.json({ error: 'Website ID is required' }, { status: 400 })
        }

        // Verify website ownership
        const website = await db.website.findFirst({
            where: {
                id: websiteId,
                userId: session.user.id,
            },
        })

        if (!website) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 })
        }

        const segments = await db.segment.findMany({
            where: { websiteId },
            include: {
                _count: {
                    select: { subscribers: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ segments })
    } catch (error) {
        console.error('Error fetching segments:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const validatedData = segmentSchema.parse(body)

        // Verify website ownership
        const website = await db.website.findFirst({
            where: {
                id: validatedData.websiteId,
                userId: session.user.id,
            },
        })

        if (!website) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 })
        }

        // Create segment
        const segment = await db.segment.create({
            data: {
                name: validatedData.name,
                description: validatedData.description,
                websiteId: validatedData.websiteId,
            },
        })

        // Add subscribers to segment if provided
        if (validatedData.subscriberIds && validatedData.subscriberIds.length > 0) {
            await db.subscriberSegment.createMany({
                data: validatedData.subscriberIds.map(subscriberId => ({
                    segmentId: segment.id,
                    subscriberId,
                })),
                skipDuplicates: true,
            })
        }

        return NextResponse.json({ segment }, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
        }

        console.error('Error creating segment:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
