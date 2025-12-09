import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function GET() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id

        // Fetch all websites owned by user
        const websites = await db.website.findMany({
            where: { userId },
            include: {
                _count: {
                    select: {
                        subscribers: true,
                        notifications: true,
                    }
                }
            }
        })

        const totalWebsites = websites.length
        const totalSubscribers = websites.reduce((acc, site) => acc + site._count.subscribers, 0)
        const totalNotifications = websites.reduce((acc, site) => acc + site._count.notifications, 0)

        // Data for Bar Chart: Subscribers per Website
        const subscribersPerWebsite = websites.map(site => ({
            name: site.name,
            count: site._count.subscribers
        }))

        // Data for Line Chart: Notifications over time (last 7 days)
        // This is a bit more complex, we need to query notifications directly
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const recentNotifications = await db.notification.findMany({
            where: {
                website: { userId },
                createdAt: { gte: sevenDaysAgo }
            },
            select: {
                createdAt: true,
                sentCount: true
            }
        })

        // Group by date
        const notificationsByDate: Record<string, number> = {}
        // Initialize last 7 days with 0
        for (let i = 0; i < 7; i++) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dateStr = d.toISOString().split('T')[0]
            notificationsByDate[dateStr] = 0
        }

        recentNotifications.forEach(n => {
            const dateStr = n.createdAt.toISOString().split('T')[0]
            if (notificationsByDate[dateStr] !== undefined) {
                notificationsByDate[dateStr] += 1 // Counting number of notifications sent, or use n.sentCount for total devices reached
            }
        })

        const notificationsOverTime = Object.entries(notificationsByDate)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, count]) => ({ date, count }))

        return NextResponse.json({
            stats: {
                totalWebsites,
                totalSubscribers,
                totalNotifications,
            },
            charts: {
                subscribersPerWebsite,
                notificationsOverTime
            }
        })

    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
