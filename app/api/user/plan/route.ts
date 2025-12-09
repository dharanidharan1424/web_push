import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { getPlanLimit } from '@/lib/plan-helpers'

export async function GET() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { plan: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Convert Infinity to -1 for JSON serialization (Infinity cannot be serialized)
        const convertLimit = (limit: number) => limit === Infinity ? -1 : limit

        return NextResponse.json({
            plan: user.plan,
            limits: {
                websites: convertLimit(getPlanLimit(user.plan, 'websites')),
                subscribers: convertLimit(getPlanLimit(user.plan, 'subscribers')),
                segments: convertLimit(getPlanLimit(user.plan, 'segments')),
                campaigns: convertLimit(getPlanLimit(user.plan, 'campaigns')),
            }
        })
    } catch (error) {
        console.error('Error fetching user plan:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
