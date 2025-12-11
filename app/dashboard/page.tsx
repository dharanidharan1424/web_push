import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import ActivationBanner from '@/components/dashboard/ActivationBanner'
import PrimaryCTA from '@/components/dashboard/PrimaryCTA'
import { SubscribersBarChart, NotificationsLineChart } from '@/components/DashboardCharts'

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    const userId = session.user.id

    // Fetch websites with counts
    const websites = await db.website.findMany({
        where: { userId },
        include: {
            _count: {
                select: { subscribers: true, notifications: true },
            },
            notifications: {
                orderBy: { createdAt: 'desc' },
                take: 1,
            }
        },
        orderBy: { createdAt: 'desc' },
    })

    const totalSubscribers = websites.reduce((acc, w) => acc + w._count.subscribers, 0)
    const totalNotifications = websites.reduce((acc, w) => acc + w._count.notifications, 0)

    // Derived business logic
    const scriptInstalled = totalSubscribers > 0;
    const activeSubscribers = Math.floor(totalSubscribers * 0.9); // Placeholder: 90% active
    const avgClickRate = "2.4%" // Mock

    // Find most recent campaign date across all websites
    let recentCampaignDate: Date | null = null;
    websites.forEach(w => {
        if (w.notifications.length > 0) {
            const date = w.notifications[0].createdAt;
            if (!recentCampaignDate || date > recentCampaignDate) {
                recentCampaignDate = date;
            }
        }
    });

    // Data for Bar Chart
    const subscribersPerWebsite = websites.map(site => ({
        name: site.name,
        count: site._count.subscribers
    }))

    // Data for Line Chart (Last 7 days)
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

    const notificationsByDate: Record<string, number> = {}
    for (let i = 0; i < 7; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        notificationsByDate[dateStr] = 0
    }

    recentNotifications.forEach(n => {
        const dateStr = n.createdAt.toISOString().split('T')[0]
        if (notificationsByDate[dateStr] !== undefined) {
            notificationsByDate[dateStr] += 1
        }
    })

    const notificationsOverTime = Object.entries(notificationsByDate)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ date, count }))

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* 1. ACTIVATION STATUS BANNER */}
            <ActivationBanner
                websiteCount={websites.length}
                scriptInstalled={scriptInstalled}
                subscriberCount={totalSubscribers}
                recentCampaign={recentCampaignDate}
            />

            {/* 2. CORE BUSINESS METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium">Total Subscribers</p>
                    <h3 className="text-2xl font-bold text-gray-900">{totalSubscribers.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium">Active Subscribers</p>
                    <h3 className="text-2xl font-bold text-gray-900">{activeSubscribers.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium">Campaigns Sent</p>
                    <h3 className="text-2xl font-bold text-gray-900">{totalNotifications.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium">Click Rate</p>
                    <h3 className="text-2xl font-bold text-gray-900">{avgClickRate}</h3>
                </div>
            </div>

            {/* 3. PRIMARY CTA STRIP */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <PrimaryCTA />
            </div>

            {/* 4. PERFORMANCE CHARTS */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-80">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscribers Growth</h3>
                    <SubscribersBarChart data={subscribersPerWebsite} />
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-80">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Performance</h3>
                    <NotificationsLineChart data={notificationsOverTime} />
                </div>
            </div>
        </div>
    )
}
