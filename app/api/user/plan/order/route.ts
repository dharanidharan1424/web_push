import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import Razorpay from 'razorpay'
import { PLAN_PRICING, Plan } from '@/lib/plans'

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { plan } = await req.json()

        if (!plan || !Object.values(Plan).includes(plan)) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        const amount = PLAN_PRICING[plan as Plan]

        if (amount === 0) {
            // Handle free plan downgrade/upgrade logic if needed, or just return success
            // For now, we assume this route is for paid upgrades
            return NextResponse.json({ error: 'Invalid plan amount' }, { status: 400 })
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        })

        const order = await razorpay.orders.create({
            amount: amount * 100, // Razorpay expects amount in smallest currency unit (paise)
            currency: 'INR',
            receipt: `abc`,
            notes: {
                userId: session.user.id!,
                plan: plan,
            },
        })

        return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency })

    } catch (error) {
        console.error('Error creating Razorpay order:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
