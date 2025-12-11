import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import crypto from 'crypto'
import { db as prisma } from '@/lib/db'
import { Plan } from '@/lib/plans'

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await req.json()

        const body = razorpay_order_id + "|" + razorpay_payment_id

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex')

        if (expectedSignature === razorpay_signature) {
            // Payment is verified
            await prisma.user.update({
                where: { id: session.user.id },
                data: { plan: plan as Plan },
            })

            console.log(`[VERIFY] User ${session.user.id} upgraded to ${plan}`)

            // Force cache revalidation to show new plan immediately
            const { revalidatePath } = await import('next/cache')
            revalidatePath('/dashboard')
            revalidatePath('/dashboard/settings')
            revalidatePath('/api/user/plan')
            revalidatePath('/api/user/plan/stats')

            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

    } catch (error) {
        console.error('Error verifying Razorpay payment:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
