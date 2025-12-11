'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface WebsiteHeaderProps {
    website: {
        id: string
        name: string
        url: string
        verified?: boolean
    }
    subscriberCount?: number
}

export default function WebsiteHeader({ website, subscriberCount = 0 }: WebsiteHeaderProps) {
    const pathname = usePathname()

    // Determine status based on verification and subscriber count
    const getStatus = () => {
        if (website.verified && subscriberCount > 0) {
            return { label: 'Active', color: 'bg-emerald-100 text-emerald-700', icon: '🟢' }
        } else if (subscriberCount > 0) {
            return { label: 'Pending Verification', color: 'bg-amber-100 text-amber-700', icon: '🟡' }
        } else {
            return { label: 'Script Missing', color: 'bg-red-100 text-red-700', icon: '🔴' }
        }
    }

    const status = getStatus()

    // Sub-navigation tabs
    const tabs: { name: string; href: string; exact?: boolean; locked?: boolean }[] = [
        { name: 'Overview', href: `/dashboard/websites/${website.id}`, exact: true },
        { name: 'Subscribers', href: `/dashboard/websites/${website.id}/subscribers` },
        { name: 'Segments', href: `/dashboard/websites/${website.id}/segments` },
        { name: 'Campaigns', href: `/dashboard/websites/${website.id}/campaigns` },
        { name: 'Automation', href: `/dashboard/websites/${website.id}/automation`, locked: true },
        { name: 'Integration', href: `/dashboard/websites/${website.id}/integration` },
        { name: 'Permission Prompt', href: `/dashboard/websites/${website.id}/prompt` },
        { name: 'Settings', href: `/dashboard/websites/${website.id}/settings` },
    ]

    const isTabActive = (tab: typeof tabs[0]) => {
        if (tab.exact) {
            return pathname === tab.href
        }
        return pathname?.startsWith(tab.href)
    }

    return (
        <div className="bg-white border-b border-gray-200 animate-fade-in">
            {/* Header Section */}
            <div className="px-6 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">{website.name}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color} flex items-center gap-1.5`}>
                                <span>{status.icon}</span>
                                {status.label}
                            </span>
                        </div>
                        <a
                            href={website.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5 w-fit"
                        >
                            {website.url}
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-3">
                        <Link
                            href={`/dashboard/websites/${website.id}/campaigns/new`}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-sm hover:shadow-md flex items-center gap-2 active:scale-[0.98]"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                            Send Campaign
                        </Link>
                    </div>
                </div>
            </div>

            {/* Sub-navigation Tabs */}
            <div className="px-6">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {tabs.map((tab) => {
                        const isActive = isTabActive(tab)
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-all ${isActive
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.name}
                                {tab.locked && <span className="ml-1 text-xs">🔒</span>}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}
