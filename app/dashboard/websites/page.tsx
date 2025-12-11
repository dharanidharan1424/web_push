'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import WebsiteCard from '@/components/dashboard/WebsiteCard'
import BulkActionToolbar from '@/components/dashboard/BulkActionToolbar'

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

    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([])

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

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === websites.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(websites.map(w => w.id))
        }
    }

    const handleBulkSend = () => {
        alert('Bulk send not implemented yet (Agency Feature)')
    }

    const handleBulkExport = () => {
        alert('Exporting data for: ' + selectedIds.join(', '))
    }

    return (
        <div className="space-y-8 animate-fade-in">
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

            {/* Bulk Actions */}
            <BulkActionToolbar
                selectedIds={selectedIds}
                onSendCampaign={handleBulkSend}
                onExport={handleBulkExport}
            />

            {/* Add Website Form */}
            {showAddForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in mb-6">
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

            {/* Websites Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
            ) : websites.length > 0 ? (
                <div>
                    {/* Select All Checkbox (Optional UI enhancement) */}
                    {websites.length > 1 && (
                        <div className="flex items-center mb-4 ml-1">
                            <input
                                type="checkbox"
                                checked={selectedIds.length === websites.length}
                                onChange={toggleSelectAll}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">Select All</span>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {websites.map((website) => (
                            <div key={website.id} className="relative flex">
                                <div className="absolute top-4 left-4 z-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(website.id)}
                                        onChange={() => toggleSelection(website.id)}
                                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 shadow-sm"
                                    />
                                </div>
                                <div className="w-full">
                                    <WebsiteCard
                                        id={website.id}
                                        name={website.name}
                                        url={website.url}
                                        verified={website._count.subscribers > 0} // Placeholder verification logic
                                        scriptInstalled={website._count.subscribers > 0} // Placeholder
                                        subscriberCount={website._count.subscribers}
                                        healthScore="Good" // Placeholder
                                        lastCampaignAt={null} // Need to fetch if not available
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
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
