import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const subscriberSchema = z.object({
    websiteId: z.string(),
    subscription: z.object({
        endpoint: z.string(),
        keys: z.object({
            p256dh: z.string(),
            auth: z.string(),
        }),
    }),
    userAgent: z.string().optional(),
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const validatedData = subscriberSchema.parse(body)

        // Check if website exists
        const website = await db.website.findUnique({
            where: { id: validatedData.websiteId },
        })

        if (!website) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 })
        }

        // Check if subscriber already exists
        const existingSubscriber = await db.subscriber.findUnique({
            where: { endpoint: validatedData.subscription.endpoint },
        })

        if (existingSubscriber) {
            return NextResponse.json({
                message: 'Already subscribed',
                subscriber: existingSubscriber
            })
        }

        // Create new subscriber
        const subscriber = await db.subscriber.create({
            data: {
                endpoint: validatedData.subscription.endpoint,
                p256dh: validatedData.subscription.keys.p256dh,
                auth: validatedData.subscription.keys.auth,
                websiteId: validatedData.websiteId,
                userAgent: validatedData.userAgent,
            },
        })

        return NextResponse.json({
            message: 'Subscribed successfully',
            subscriber
        }, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
        }

        console.error('Error creating subscriber:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
