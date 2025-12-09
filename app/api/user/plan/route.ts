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

        return NextResponse.json({
            plan: user.plan,
            limits: {
                websites: getPlanLimit(user.plan, 'websites'),
                subscribers: getPlanLimit(user.plan, 'subscribers'),
                segments: getPlanLimit(user.plan, 'segments'),
                campaigns: getPlanLimit(user.plan, 'campaigns'),
            }
        })
    } catch (error) {
        console.error('Error fetching user plan:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
