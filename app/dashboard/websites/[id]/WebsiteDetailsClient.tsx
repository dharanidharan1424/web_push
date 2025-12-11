'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import KPICard from '@/components/dashboard/KPICard'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import Card from '@/components/ui/Card'
import WebsiteHealthBar from '@/components/dashboard/WebsiteHealthBar'
import Button from '@/components/ui/Button'
import { parseUserAgent, getDeviceIcon } from '@/lib/userAgentParser'

interface WebsiteDetailsClientProps {
    website: {
        id: string
        name: string
        url: string
        createdAt: Date
        _count: {
            subscribers: number
            notifications: number
        }
        subscribers: any[]
        notifications: any[]
        promptEnabled: boolean
    }
    appUrl: string
}

export default function WebsiteDetailsClient({ website, appUrl }: WebsiteDetailsClientProps) {
    // Unsubscribe metrics state
    const [unsubscribeMetrics, setUnsubscribeMetrics] = useState({ totalSubscribers: 0, totalUnsubscribed: 0, unsubscribeRate: 0 })

    // Fetch metrics on mount / website change
    useEffect(() => {
        if (!website?.id) return
        const fetchMetrics = async () => {
            try {
                const res = await fetch(`/api/metrics/unsubscribe?websiteId=${website.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setUnsubscribeMetrics(data)
                }
            } catch (e) {
                console.error('Failed to load unsubscribe metrics', e)
            }
        }
        fetchMetrics()
    }, [website?.id])

    // Find last timestamps
    const lastSubscriber = website.subscribers.length > 0 ? website.subscribers[0].createdAt : null;
    const lastCampaign = website.notifications.length > 0 ? website.notifications[0].createdAt : null;

    return (
        <div className="space-y-6 animate-fade-in">

            {/* 1. Website Health Bar */}
            <WebsiteHealthBar
                scriptInstalled={website._count.subscribers > 0} // Placeholder logic
                permissionEnabled={website.promptEnabled}
                lastSubscriberAt={lastSubscriber}
                lastCampaignAt={lastCampaign}
            />

            {/* 2. KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Subscribers"
                    value={website._count.subscribers}
                    subtitle="All time"
                />
                <KPICard
                    title="Active Subscribers"
                    value={unsubscribeMetrics.totalSubscribers - unsubscribeMetrics.totalUnsubscribed}
                    subtitle="Receiving notifications"
                    trend={{ direction: 'up', value: 'Live' }}
                />
                <KPICard
                    title="Unsubscribe Rate"
                    value={`${unsubscribeMetrics.unsubscribeRate}%`}
                    trend={
                        unsubscribeMetrics.unsubscribeRate < 5
                            ? { direction: 'down', value: 'Good' }
                            : { direction: 'neutral', value: 'Fair' }
                    }
                />
                <KPICard
                    title="CTR (Avg)"
                    value="2.4%" // Placeholder
                    subtitle="Click through rate"
                />
            </div>

            {/* 3. Action Center */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link href={`/dashboard/websites/${website.id}/campaigns/new`}>
                        <Button variant="primary">🚀 Send Campaign</Button>
                    </Link>
                    <Link href={`/dashboard/websites/${website.id}/segments/new`}>
                        <Button variant="secondary">🧩 Create Segment</Button>
                    </Link>
                    <Link href={`/dashboard/websites/${website.id}/subscribers`}>
                        <Button variant="ghost">👥 View Subscribers</Button>
                    </Link>
                </div>
            </div>

            {/* 4. Stacked Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Feed (Left - 2/3 width) */}
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <ActivityFeed
                        activities={[
                            ...website.subscribers.slice(0, 5).map((sub: any) => ({
                                id: sub.id,
                                type: 'subscriber' as const,
                                title: 'New Subscriber',
                                subtitle: parseUserAgent(sub.userAgent).formatted,
                                timestamp: new Date(sub.createdAt)
                            })),
                            ...website.notifications.slice(0, 5).map((notif: any) => ({
                                id: notif.id,
                                type: 'campaign' as const,
                                title: `Campaign Sent - "${notif.title}"`,
                                subtitle: `Sent to ${notif.sentCount} subscribers`,
                                timestamp: new Date(notif.createdAt)
                            }))
                        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10)}
                    />
                </div>

                {/* Device & Engagement (Right - 1/3 width) */}
                <div className="space-y-6">
                    <Card variant="default" padding="md">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Device Breakdown</h3>
                        <div className="space-y-3">
                            {(() => {
                                const devices = website.subscribers.reduce((acc: any, sub: any) => {
                                    const parsed = parseUserAgent(sub.userAgent)
                                    acc[parsed.deviceType] = (acc[parsed.deviceType] || 0) + 1
                                    return acc
                                }, {})
                                const total = website.subscribers.length || 1

                                return Object.entries(devices).map(([device, count]: [string, any]) => {
                                    const percentage = Math.round((count / total) * 100)
                                    return (
                                        <div key={device}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <span>{getDeviceIcon(device)}</span>
                                                    {device}
                                                </span>
                                                <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full bg-indigo-600 transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )
                                })
                            })()}
                            {website.subscribers.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">No data available yet</p>
                            )}
                        </div>
                    </Card>

                    <Card variant="default" padding="md">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Performance</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Active</span>
                                <span className="text-lg font-bold text-emerald-600">{unsubscribeMetrics.totalSubscribers - unsubscribeMetrics.totalUnsubscribed}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Unsubscribed</span>
                                <span className="text-lg font-bold text-red-600 text-sm">{unsubscribeMetrics.totalUnsubscribed} ({unsubscribeMetrics.unsubscribeRate}%)</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
