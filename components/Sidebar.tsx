'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'

export default function Sidebar() {
    const pathname = usePathname()
    const params = useParams()
    const websiteId = params?.id as string | undefined

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

    // Global navigation items (account level)
    const globalNavItems = [
        { name: 'Home', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Sites & Apps', href: '/dashboard/websites', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
        { name: 'Analytics', href: '/dashboard/analytics', icon: 'M3 3v18h18' }, // placeholder icon
        { name: 'Billing & Plan', href: '/dashboard/billing', icon: 'M12 8c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2s2-.9 2-2v-4c0-1.1-.9-2-2-2z' },
        // Team tab only visible for agency plan; placeholder logic (will be hidden via CSS if not agency)
        { name: 'Team', href: '/dashboard/team', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { name: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ]

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 font-sans">
            <div className="p-6 border-b border-gray-100">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-all">
                        W
                    </div>
                    <div className="overflow-hidden">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight truncate">
                            WebPush
                        </h2>
                        <p className="text-xs text-gray-500">Push Notifications</p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {globalNavItems.map((item) => {
                    const isActive = isLinkActive(item.href)
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm'
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

            <div className="p-4 border-t border-gray-100 space-y-2">
                <Link
                    href="/help"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
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
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
            </div>
        </aside>
    )
}
