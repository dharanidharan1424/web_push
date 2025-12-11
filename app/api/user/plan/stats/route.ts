import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { getPlanLimit } from '@/lib/plan-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Debug logging
        console.log(`[PLAN_STATS] Fetching stats for user: ${session.user.id}`)

        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { plan: true }
        })

        if (!user) {
            console.error(`[PLAN_STATS] User not found in DB: ${session.user.id}`)
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        console.log(`[PLAN_STATS] User found, plan: ${user.plan}`)

        // Get actual counts
        const websiteCount = await db.website.count({
            where: { userId: session.user.id }
        })

        const subscriberCount = await db.subscriber.count({
            where: { website: { userId: session.user.id } }
        })

        const segmentCount = await db.segment.count({
            where: { website: { userId: session.user.id } }
        })

        const campaignCount = await db.notification.count({
            where: { website: { userId: session.user.id } }
        })

        return NextResponse.json({
            plan: user.plan,
            usage: {
                websites: websiteCount,
                subscribers: subscriberCount,
                segments: segmentCount,
                campaigns: campaignCount,
            },
            limits: {
                // Convert Infinity to -1 for JSON serialization
                websites: getPlanLimit(user.plan, 'websites') === Infinity ? -1 : getPlanLimit(user.plan, 'websites'),
                subscribers: getPlanLimit(user.plan, 'subscribers') === Infinity ? -1 : getPlanLimit(user.plan, 'subscribers'),
                segments: getPlanLimit(user.plan, 'segments') === Infinity ? -1 : getPlanLimit(user.plan, 'segments'),
                campaigns: getPlanLimit(user.plan, 'campaigns') === Infinity ? -1 : getPlanLimit(user.plan, 'campaigns'),
            }
        })
    } catch (error) {
        console.error('Error fetching plan stats:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
