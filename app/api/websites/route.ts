import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const websiteSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    url: z.string().url('Invalid URL'),
})

export async function GET(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const websites = await db.website.findMany({
            where: { userId: session.user.id },
            include: {
                _count: {
                    select: { subscribers: true, notifications: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ websites })
    } catch (error) {
        console.error('Error fetching websites:', error)
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
        const validatedData = websiteSchema.parse(body)

        // Check plan limits before creating
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { plan: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Count existing websites
        const websiteCount = await db.website.count({
            where: { userId: session.user.id }
        })

        // Check if user has reached their plan limit
        const { checkPlanLimit } = await import('@/lib/plan-helpers')
        const limitError = checkPlanLimit(user.plan, 'websites', websiteCount)

        if (limitError) {
            return NextResponse.json(
                {
                    error: limitError,
                    plan: user.plan,
                    currentCount: websiteCount,
                    upgradeRequired: true
                },
                { status: 403 }
            )
        }

        const website = await db.website.create({
            data: {
                name: validatedData.name,
                url: validatedData.url,
                userId: session.user.id,
            },
        })

        return NextResponse.json({ website }, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
        }

        console.error('Error creating website:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { id, name, url } = body

        if (!id) {
            return NextResponse.json({ error: 'Website ID is required' }, { status: 400 })
        }

        const validatedData = websiteSchema.parse({ name, url })

        // Verify ownership
        const existingWebsite = await db.website.findFirst({
            where: { id: id, userId: session.user.id }
        })

        if (!existingWebsite) {
            return NextResponse.json({ error: 'Website not found or unauthorized' }, { status: 404 })
        }

        const website = await db.website.update({
            where: { id: id },
            data: {
                name: validatedData.name,
                url: validatedData.url,
            },
        })

        return NextResponse.json({ website })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
        }

        console.error('Error updating website:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
