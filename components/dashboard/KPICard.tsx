'use client'

import Card from '../ui/Card'

interface KPICardProps {
    title: string
    value: string | number
    trend?: {
        direction: 'up' | 'down' | 'neutral'
        value: string
    }
    subtitle?: string
    onClick?: () => void
}

export default function KPICard({ title, value, trend, subtitle, onClick }: KPICardProps) {
    const trendColors = {
        up: 'text-emerald-600',
        down: 'text-red-600',
        neutral: 'text-gray-500'
    }

    const trendIcons = {
        up: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
        down: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
        ),
        neutral: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            </svg>
        )
    }

    return (
        <Card
            variant="default"
            padding="md"
            hover={!!onClick}
            onClick={onClick}
            className="animate-scale-in"
        >
            <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
                <div className="flex items-baseline gap-3">
                    <h3 className="text-3xl font-bold text-gray-900 data-value">{value}</h3>
                    {trend && (
                        <div className={`flex items-center gap-1 text-sm font-semibold ${trendColors[trend.direction]}`}>
                            {trendIcons[trend.direction]}
                            <span>{trend.value}</span>
                        </div>
                    )}
                </div>
                {subtitle && (
                    <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
                )}
            </div>
        </Card>
    )
}
