'use client'

import Card from '../ui/Card'

interface Activity {
    id: string
    type: 'subscriber' | 'campaign' | 'unsubscribe'
    title: string
    subtitle: string
    timestamp: Date
    icon?: string
}

interface ActivityFeedProps {
    activities: Activity[]
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
    const getActivityIcon = (type: Activity['type']) => {
        switch (type) {
            case 'subscriber':
                return {
                    icon: '🟢',
                    bgColor: 'bg-emerald-50',
                    textColor: 'text-emerald-700'
                }
            case 'campaign':
                return {
                    icon: '🔔',
                    bgColor: 'bg-blue-50',
                    textColor: 'text-blue-700'
                }
            case 'unsubscribe':
                return {
                    icon: '❌',
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-700'
                }
        }
    }

    const formatTimestamp = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
        return `${days} day${days > 1 ? 's' : ''} ago`
    }

    return (
        <Card variant="default" padding="none" className="animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Activity Feed</h2>
                <p className="text-sm text-gray-500 mt-1">Recent events across your website</p>
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {activities.length > 0 ? (
                    activities.map((activity) => {
                        const { icon, bgColor, textColor } = getActivityIcon(activity.type)
                        return (
                            <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-lg flex-shrink-0`}>
                                        {icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                                        <p className="text-sm text-gray-600 mt-0.5">{activity.subtitle}</p>
                                        <p className="text-xs text-gray-400 mt-1">{formatTimestamp(activity.timestamp)}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="px-6 py-12 text-center text-gray-500">
                        <p className="text-sm">No recent activity</p>
                        <p className="text-xs mt-1">Activity will appear here as users interact with your site</p>
                    </div>
                )}
            </div>
        </Card>
    )
}
