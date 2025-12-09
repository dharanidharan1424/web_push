import webpush from 'web-push'

// Configure VAPID details
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    )
}

export interface PushSubscription {
    endpoint: string
    keys: {
        p256dh: string
        auth: string
    }
}

export interface NotificationPayload {
    title: string
    body: string
    icon?: string
    url?: string
}

export async function sendPushNotification(
    subscription: PushSubscription,
    payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
    try {
        await webpush.sendNotification(
            subscription,
            JSON.stringify(payload)
        )
        return { success: true }
    } catch (error: any) {
        console.error('Error sending push notification:', error)
        return {
            success: false,
            error: error.message || 'Failed to send notification'
        }
    }
}

export { webpush }
