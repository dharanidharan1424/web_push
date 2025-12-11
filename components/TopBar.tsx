'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface TopBarProps {
    userName?: string
    userEmail?: string
}

export default function TopBar({ userName, userEmail }: TopBarProps) {
    const pathname = usePathname()
    const [showAccountMenu, setShowAccountMenu] = useState(false)
    const [userPlan, setUserPlan] = useState('FREE')

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await fetch('/api/user/plan/stats', { cache: 'no-store' })
                if (res.ok) {
                    const data = await res.json()
                    setUserPlan(data.plan || 'FREE')
                }
            } catch (err) {
                console.error('Error fetching plan:', err)
            }
        }
        fetchPlan()
    }, [])

    // Generate breadcrumbs from pathname
    const generateBreadcrumbs = () => {
        if (!pathname) return []

        const segments = pathname.split('/').filter(Boolean)
        const breadcrumbs: { label: string; href: string }[] = []

        // Always start with Dashboard
        breadcrumbs.push({ label: 'Dashboard', href: '/dashboard' })

        if (segments.length === 1) return breadcrumbs // Just /dashboard

        // Handle /dashboard/websites
        if (segments[1] === 'websites') {
            breadcrumbs.push({ label: 'Sites & Apps', href: '/dashboard/websites' })

            // Handle /dashboard/websites/[id]
            if (segments[2]) {
                // We'll need to fetch the website name - for now use ID
                const websiteId = segments[2]
                breadcrumbs.push({ label: 'Website', href: `/dashboard/websites/${websiteId}` })

                // Handle sub-pages
                if (segments[3]) {
                    const subPage = segments[3]
                    const subPageLabels: Record<string, string> = {
                        campaigns: 'Campaigns',
                        subscribers: 'Subscribers',
                        segments: 'Segments',
                        integration: 'Integration',
                        settings: 'Settings'
                    }
                    breadcrumbs.push({
                        label: subPageLabels[subPage] || subPage,
                        href: `/dashboard/websites/${websiteId}/${subPage}`
                    })
                }
            }
        } else if (segments[1] === 'settings') {
            breadcrumbs.push({ label: 'Settings', href: '/dashboard/settings' })
        } else if (segments[1] === 'campaigns') {
            breadcrumbs.push({ label: 'Campaigns', href: '/dashboard/campaigns' })
        }

        return breadcrumbs
    }

    const breadcrumbs = generateBreadcrumbs()

    const planColors = {
        FREE: 'bg-gray-100 text-gray-700',
        STARTER: 'bg-blue-100 text-blue-700',
        PRO: 'bg-indigo-100 text-indigo-700',
        AGENCY: 'bg-purple-100 text-purple-700'
    }

    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 animate-slide-in-top">
            <div className="px-6 py-3">
                <div className="flex items-center justify-between">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm">
                        {breadcrumbs.map((crumb, index) => (
                            <div key={crumb.href} className="flex items-center gap-2">
                                {index > 0 && (
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                                {index === breadcrumbs.length - 1 ? (
                                    <span className="font-medium text-gray-900">{crumb.label}</span>
                                ) : (
                                    <Link
                                        href={crumb.href}
                                        className="text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        {crumb.label}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Right side - Plan, Help, Account */}
                    <div className="flex items-center gap-4">
                        {/* Plan Badge */}
                        <Link
                            href="/dashboard/settings"
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all hover:scale-105 ${planColors[userPlan as keyof typeof planColors] || planColors.FREE
                                }`}
                        >
                            {userPlan} Plan
                        </Link>

                        {/* Help */}
                        <Link
                            href="/help"
                            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Help
                        </Link>

                        {/* Account Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowAccountMenu(!showAccountMenu)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-medium text-gray-900">{userName || 'User'}</p>
                                    <p className="text-xs text-gray-500">{userEmail || ''}</p>
                                </div>
                                <svg className={`w-4 h-4 text-gray-400 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {showAccountMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 animate-scale-in">
                                    <Link
                                        href="/dashboard/settings"
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setShowAccountMenu(false)}
                                    >
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Account Settings
                                    </Link>
                                    <Link
                                        href="/pricing"
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setShowAccountMenu(false)}
                                    >
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Upgrade Plan
                                    </Link>
                                    <div className="border-t border-gray-100 my-2"></div>
                                    <button
                                        onClick={() => {
                                            fetch('/api/auth/logout', { method: 'POST' })
                                                .then(() => (window.location.href = '/login'))
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
