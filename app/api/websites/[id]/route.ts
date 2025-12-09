import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

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

        const website = await db.website.findFirst({
            where: {
                id: id,
                userId: session.user.id,
            },
            include: {
                subscribers: {
                    orderBy: { createdAt: 'desc' },
                    take: 100,
                },
                _count: {
                    select: { subscribers: true, notifications: true },
                },
            },
        })

        if (!website) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 })
        }

        return NextResponse.json({ website })
    } catch (error) {
        console.error('Error fetching website:', error)
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

        const website = await db.website.findFirst({
            where: {
                id: id,
                userId: session.user.id,
            },
        })

        if (!website) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 })
        }

        await db.website.delete({
            where: { id: id },
        })

        return NextResponse.json({ message: 'Website deleted successfully' })
    } catch (error) {
        console.error('Error deleting website:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
