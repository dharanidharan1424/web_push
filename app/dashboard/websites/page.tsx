'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Website {
    id: string
    name: string
    url: string
    createdAt: string
    _count: {
        subscribers: number
        notifications: number
    }
}

export default function WebsitesPage() {
    const router = useRouter()
    const [websites, setWebsites] = useState<Website[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [name, setName] = useState('')
    const [url, setUrl] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [userPlan, setUserPlan] = useState('FREE')
    const [websiteLimit, setWebsiteLimit] = useState(1)

    useEffect(() => {
        fetchWebsites()
        fetchPlanInfo()
    }, [])

    const fetchWebsites = async () => {
        try {
            const res = await fetch('/api/websites')
            const data = await res.json()
            setWebsites(data.websites || [])
        } catch (err) {
            console.error('Error fetching websites:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchPlanInfo = async () => {
        try {
            const res = await fetch('/api/user/plan')
            if (res.ok) {
                const data = await res.json()
                setUserPlan(data.plan || 'FREE')
                setWebsiteLimit(data.limits?.websites || 1)
            }
        } catch (err) {
            console.error('Error fetching plan info:', err)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        try {
            const res = await fetch('/api/websites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, url }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to create website')
                return
            }

            setName('')
            setUrl('')
            setShowAddForm(false)
            fetchWebsites()
        } catch (err) {
            setError('An error occurred')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this website?')) return

        try {
            await fetch(`/api/websites/${id}`, { method: 'DELETE' })
            fetchWebsites()
        } catch (err) {
            console.error('Error deleting website:', err)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sites & Apps</h1>
                    <p className="text-gray-500 mt-1">Manage your connected websites and applications.</p>
                </div>
                <button
                    onClick={() => {
                        // Check if at limit (-1 means unlimited)
                        if (websiteLimit !== -1 && websites.length >= websiteLimit) {
                            setShowUpgradeModal(true)
                        } else {
                            setShowAddForm(!showAddForm)
                        }
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm text-sm"
                >
                    {showAddForm ? 'Cancel' : 'Add Website'}
                </button>
            </div>

            {/* Add Website Form */}
            {showAddForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Website</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Website Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="My Awesome Site"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Website URL
                            </label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="https://example.com"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
                        >
                            {submitting ? 'Creating...' : 'Create Website'}
                        </button>
                    </form>
                </div>
            )}

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Upgrade Required</h2>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <p className="text-center text-gray-700 mb-2">
                                You've reached your <span className="font-bold">{userPlan}</span> plan limit of <span className="font-bold">{websiteLimit === -1 ? 'Unlimited' : websiteLimit}</span> {websiteLimit === 1 ? 'website' : 'websites'}.
                            </p>
                            <p className="text-center text-gray-500 text-sm">
                                Upgrade your plan to create more websites and unlock additional features.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Link
                                href="/dashboard/settings"
                                className="block w-full py-3 px-4 bg-indigo-600 text-white text-center rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                onClick={() => setShowUpgradeModal(false)}
                            >
                                View Upgrade Options
                            </Link>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Websites List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
            ) : websites.length > 0 ? (
                <div className="grid gap-4">
                    {websites.map((website) => (
                        <div key={website.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-indigo-200 transition-all group">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl">
                                        {website.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            <Link href={`/dashboard/websites/${website.id}`}>{website.name}</Link>
                                        </h3>
                                        <a href={website.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:underline">
                                            {website.url}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Subscribers</p>
                                        <p className="text-lg font-bold text-gray-900">{website._count.subscribers}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Notifications</p>
                                        <p className="text-lg font-bold text-gray-900">{website._count.notifications}</p>
                                    </div>
                                    <div className="h-8 w-px bg-gray-200 mx-2"></div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/dashboard/websites/${website.id}`}
                                            className="px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors font-medium text-sm"
                                        >
                                            Manage
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(website.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Website"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No websites yet</h3>
                    <p className="text-gray-500 mb-6">Add your first website to start sending push notifications.</p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Add Website
                    </button>
                </div>
            )}
        </div>
    )
}
