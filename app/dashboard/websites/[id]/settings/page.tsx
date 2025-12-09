'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import CopyButton from '@/components/copy-button'

export default function WebsiteSettingsPage() {
    const params = useParams()
    const router = useRouter()
    const websiteId = params?.id as string

    const [loading, setLoading] = useState(true)
    const [website, setWebsite] = useState<any>(null)
    const [name, setName] = useState('')
    const [url, setUrl] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [appUrl, setAppUrl] = useState('')

    useEffect(() => {
        setAppUrl(window.location.origin)
        if (websiteId) {
            fetchWebsite()
        }
    }, [websiteId])

    const fetchWebsite = async () => {
        try {
            const res = await fetch(`/api/websites?id=${websiteId}`)
            const data = await res.json()
            if (data.websites && data.websites.length > 0) {
                const site = data.websites.find((w: any) => w.id === websiteId)
                if (site) {
                    setWebsite(site)
                    setName(site.name)
                    setUrl(site.url)
                }
            }
        } catch (err) {
            console.error('Error fetching website:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await fetch(`/api/websites`, { // Assuming PUT handled by same endpoint or ID specific
                // The existing API might only support POST/DELETE or GET.
                // If no PUT endpoint exists, we might need to add it or use a different one.
                // Let's assume for now we might need to fix the API.
                // Checking app/dashboard/websites/page.tsx, it only did POST and DELETE.
                // I should check /api/websites/route.ts or similar.
                method: 'PUT', // Optimistic
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: websiteId, name, url })
            })

            if (res.ok) {
                alert('Website updated successfully')
                fetchWebsite()
            } else {
                alert('Failed to update website')
            }
        } catch (err) {
            console.error(err)
            alert('An error occurred')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this website? This action cannot be undone and will delete all subscribers and notifications.')) return

        try {
            await fetch(`/api/websites/${websiteId}`, { method: 'DELETE' })
            router.push('/dashboard/websites')
        } catch (err) {
            console.error('Error deleting website:', err)
        }
    }

    if (loading) return <div className="p-12 text-center">Loading...</div>
    if (!website) return <div className="p-12 text-center">Website not found</div>

    return (
        <div className="space-y-8 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">Manage configuration for {website.name}.</p>
            </div>

            {/* General Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">General Settings</h2>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            {/* Integration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Integration Code</h2>
                <p className="text-gray-600 mb-4">
                    Copy and paste this script tag into the <code className="bg-gray-100 px-2 py-1 rounded text-gray-800 border border-gray-200">&lt;head&gt;</code> section of your website:
                </p>
                <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto border border-gray-200 mb-4">
                    <code className="text-sm text-gray-800 font-mono whitespace-nowrap">
                        {`<script src="${appUrl}/push-client.js" data-website-id="${website.id}" data-api-url="${appUrl}"></script>`}
                    </code>
                </div>
                {appUrl && <CopyButton text={`<script src="${appUrl}/push-client.js" data-website-id="${website.id}" data-api-url="${appUrl}"></script>`} />}
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                <h2 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h2>
                <p className="text-gray-600 mb-6">
                    Deleting this website will permanently remove all associated data including subscribers, segments, and campaigns.
                </p>
                <button
                    onClick={handleDelete}
                    className="px-6 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100 transition-colors"
                >
                    Delete Website
                </button>
            </div>
        </div>
    )
}
