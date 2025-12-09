'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Sidebar() {
    const pathname = usePathname()
    const params = useParams()
    const websiteId = params?.id as string | undefined
    const [stats, setStats] = useState({
        usage: { websites: 0, subscribers: 0, segments: 0, campaigns: 0 },
        limits: { websites: 1, subscribers: 100, segments: 0, campaigns: 2 }
    })
    const [userPlan, setUserPlan] = useState('FREE')
    const [loading, setLoading] = useState(true)

    // Fetch plan stats
    useEffect(() => {
        const fetchPlanStats = async () => {
            try {
                const res = await fetch('/api/user/plan/stats')
                if (res.ok) {
                    const data = await res.json()
                    setUserPlan(data.plan || 'FREE')
                    setStats({
                        usage: data.usage || { websites: 0, subscribers: 0, segments: 0, campaigns: 0 },
                        limits: data.limits || { websites: 1, subscribers: 100, segments: 0, campaigns: 2 }
                    })
                }
            } catch (err) {
                console.error('Error fetching plan stats:', err)
            } finally {
                setLoading(false)
            }
        }

        if (pathname && pathname !== '/' && pathname !== '/login' && pathname !== '/signup') {
            fetchPlanStats()
        }
    }, [pathname])

    // Hide sidebar on landing page, login, and signup
    if (!pathname || pathname === '/' || pathname === '/login' || pathname === '/signup') {
        return null
    }

    // Helper to determine if a link is active
    const isLinkActive = (href: string) => {
        if (href === '/dashboard' && pathname === '/dashboard') return true
        if (href !== '/dashboard' && pathname?.startsWith(href)) return true
        return false
    }

    const globalNavItems = [
        { name: 'Home', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Sites & Apps', href: '/dashboard/websites', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
        { name: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ]

    const websiteNavItems = websiteId ? [
        { name: 'Overview', href: `/dashboard/websites/${websiteId}`, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Campaigns', href: `/dashboard/websites/${websiteId}/campaigns`, icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
        { name: 'Subscribers', href: `/dashboard/websites/${websiteId}/subscribers`, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { name: 'Segments', href: `/dashboard/websites/${websiteId}/segments`, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { name: 'Settings', href: `/dashboard/websites/${websiteId}/settings`, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ] : []

    const currentNavItems = websiteId ? websiteNavItems : globalNavItems

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 font-sans">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                        W
                    </div>
                    <div className="overflow-hidden">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight truncate">
                            {websiteId ? 'Site Manager' : 'WebPush'}
                        </h2>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {websiteId && (
                    <div className="mb-4 pb-4 border-b border-gray-100">
                        <Link
                            href="/dashboard/websites"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Sites
                        </Link>
                    </div>
                )}

                {currentNavItems.map((item) => {
                    const isActive = isLinkActive(item.href)
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-indigo-50 text-indigo-600 font-medium shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <svg className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-100 space-y-4">
                {/* Global Plan & Usage only on global view or always? Maybe always good to see limits */}
                {!websiteId && (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-3.5 border border-indigo-100">
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">{userPlan} Plan</span>
                            {userPlan !== 'AGENCY' && (
                                <Link href="/dashboard/settings" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Upgrade</Link>
                            )}
                        </div>
                        <div className="space-y-2">
                            {/* Websites */}
                            <div>
                                <div className="flex justify-between items-center text-xs mb-1">
                                    <span className={`font-medium ${stats.limits.websites === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                                        {stats.limits.websites === 0 ? '🔒 ' : ''}Websites
                                    </span>
                                    <span className={`font-semibold text-[10px] ${stats.limits.websites === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
                                        {loading ? '...' : stats.limits.websites === 0 ? 'Locked' : stats.limits.websites === -1 ? `${stats.usage.websites} / ∞` : `${stats.usage.websites} / ${stats.limits.websites}`}
                                    </span>
                                </div>
                                {stats.limits.websites > 0 && (
                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                        <div
                                            className={`h-1 rounded-full ${stats.limits.websites === Infinity ? 'bg-green-500' : 'bg-indigo-600'}`}
                                            style={{
                                                width: loading ? '0%' : stats.limits.websites === Infinity ? '5%' : `${Math.min(100, (stats.usage.websites / stats.limits.websites) * 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                            {/* Subscribers */}
                            <div>
                                <div className="flex justify-between items-center text-xs mb-1">
                                    <span className={`font-medium ${stats.limits.subscribers === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                                        {stats.limits.subscribers === 0 ? '🔒 ' : ''}Subscribers
                                    </span>
                                    <span className={`font-semibold text-[10px] ${stats.limits.subscribers === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
                                        {loading ? '...' : stats.limits.subscribers === 0 ? 'Locked' : stats.limits.subscribers === -1 ? `${stats.usage.subscribers} / ∞` : `${stats.usage.subscribers} / ${stats.limits.subscribers}`}
                                    </span>
                                </div>
                                {stats.limits.subscribers > 0 && (
                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                        <div
                                            className={`h-1 rounded-full ${stats.limits.subscribers === Infinity ? 'bg-green-500' : 'bg-indigo-600'}`}
                                            style={{
                                                width: loading ? '0%' : stats.limits.subscribers === Infinity ? '5%' : `${Math.min(100, (stats.usage.subscribers / stats.limits.subscribers) * 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                            {/* Segments */}
                            <div>
                                <div className="flex justify-between items-center text-xs mb-1">
                                    <span className={`font-medium ${stats.limits.segments === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                                        {stats.limits.segments === 0 ? '🔒 ' : ''}Segments
                                    </span>
                                    <span className={`font-semibold text-[10px] ${stats.limits.segments === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
                                        {loading ? '...' : stats.limits.segments === 0 ? 'Locked' : stats.limits.segments === -1 ? `${stats.usage.segments} / ∞` : `${stats.usage.segments} / ${stats.limits.segments}`}
                                    </span>
                                </div>
                                {stats.limits.segments > 0 && (
                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                        <div
                                            className={`h-1 rounded-full ${stats.limits.segments === Infinity ? 'bg-green-500' : 'bg-indigo-600'}`}
                                            style={{
                                                width: loading ? '0%' : stats.limits.segments === Infinity ? '5%' : `${Math.min(100, (stats.usage.segments / stats.limits.segments) * 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <Link
                        href="/help"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Help & Support
                    </Link>
                    <button
                        onClick={() => {
                            fetch('/api/auth/logout', { method: 'POST' })
                                .then(() => (window.location.href = '/login'))
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    )
}
