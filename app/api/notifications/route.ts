import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { sendPushNotification } from '@/lib/webpush'
import { z } from 'zod'

const notificationSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    body: z.string().min(1, 'Body is required'),
    url: z.string().url().optional(),
    icon: z.string().url().optional(),
    websiteId: z.string(),
    segmentIds: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const websiteId = searchParams.get('websiteId')

        const where = websiteId
            ? {
                website: { userId: session.user.id },
                websiteId
            }
            : { website: { userId: session.user.id } }

        const notifications = await db.notification.findMany({
            where,
            include: {
                website: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        })

        return NextResponse.json({ notifications })
    } catch (error) {
        console.error('Error fetching notifications:', error)
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
        const validatedData = notificationSchema.extend({
            status: z.enum(['sent', 'draft', 'scheduled']).default('sent'),
            scheduledFor: z.string().optional(),
        }).parse(body)

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

        // Create notification record
        const notification = await db.notification.create({
            data: {
                title: validatedData.title,
                body: validatedData.body,
                url: validatedData.url,
                icon: validatedData.icon,
                websiteId: validatedData.websiteId,
                segmentIds: validatedData.segmentIds || [],
                sentCount: 0,
                status: validatedData.status,
                scheduledFor: validatedData.scheduledFor ? new Date(validatedData.scheduledFor) : null,
            },
        })

        // If status is NOT sent, we just save it and return
        if (validatedData.status !== 'sent') {
            return NextResponse.json({
                message: validatedData.status === 'draft' ? 'Draft saved' : 'Campaign scheduled',
                notification,
                subscribersCount: 0,
            }, { status: 201 })
        }

        // Get subscribers to send to
        let subscribers
        if (validatedData.segmentIds && validatedData.segmentIds.length > 0) {
            // Send to specific segments
            subscribers = await db.subscriber.findMany({
                where: {
                    websiteId: validatedData.websiteId,
                    segments: {
                        some: {
                            segmentId: { in: validatedData.segmentIds },
                        },
                    },
                },
            })
        } else {
            // Send to all subscribers
            subscribers = await db.subscriber.findMany({
                where: { websiteId: validatedData.websiteId },
            })
        }

        // Send push notifications
        let sentCount = 0
        const sendPromises = subscribers.map(async (subscriber: any) => {
            const result = await sendPushNotification(
                {
                    endpoint: subscriber.endpoint,
                    keys: {
                        p256dh: subscriber.p256dh,
                        auth: subscriber.auth,
                    },
                },
                {
                    title: validatedData.title,
                    body: validatedData.body,
                    icon: validatedData.icon,
                    url: validatedData.url,
                }
            )

            // Log the result
            await db.notificationLog.create({
                data: {
                    notificationId: notification.id,
                    subscriberId: subscriber.id,
                    status: result.success ? 'sent' : 'failed',
                    error: result.error,
                },
            })

            if (result.success) sentCount++
        })

        await Promise.all(sendPromises)

        // Update sent count
        await db.notification.update({
            where: { id: notification.id },
            data: { sentCount },
        })

        return NextResponse.json({
            message: 'Notification sent successfully',
            notification: { ...notification, sentCount },
            subscribersCount: subscribers.length,
        }, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
        }

        console.error('Error sending notification:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
