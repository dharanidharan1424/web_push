'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Segment {
    id: string
    name: string
    _count: {
        subscribers: number
    }
}

function CampaignForm() {
    const router = useRouter()
    const params = useParams()
    const websiteId = params?.id as string

    const [segments, setSegments] = useState<Segment[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [url, setUrl] = useState('')
    const [icon, setIcon] = useState('')
    const [selectedSegments, setSelectedSegments] = useState<string[]>([])
    const [scheduledFor, setScheduledFor] = useState('')
    const [websiteName, setWebsiteName] = useState('')

    useEffect(() => {
        if (websiteId) {
            fetchSegments(websiteId)
            fetchWebsiteDetails(websiteId)
        }
    }, [websiteId])

    const fetchWebsiteDetails = async (wId: string) => {
        try {
            const res = await fetch(`/api/websites?id=${wId}`)
            const data = await res.json()
            if (data.websites && data.websites.length > 0) {
                const site = data.websites.find((w: any) => w.id === wId)
                if (site) setWebsiteName(site.name)
            }
        } catch (err) {
            console.error('Error fetching website details:', err)
        }
    }

    const fetchSegments = async (wId: string) => {
        try {
            const res = await fetch(`/api/segments?websiteId=${wId}`)
            const data = await res.json()
            setSegments(data.segments || [])
        } catch (err) {
            console.error('Error fetching segments:', err)
        }
    }

    const handleSubmit = async (e: React.FormEvent, status: 'sent' | 'draft' | 'scheduled') => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    websiteId,
                    title,
                    body,
                    url: url || undefined,
                    icon: icon || undefined,
                    segmentIds: selectedSegments.length > 0 ? selectedSegments : undefined,
                    status,
                    scheduledFor: status === 'scheduled' ? scheduledFor : undefined
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to save campaign')
                return
            }

            if (status === 'sent') {
                alert(`Campaign sent to ${data.subscribersCount} subscribers!`)
            } else if (status === 'scheduled') {
                alert('Campaign scheduled successfully!')
            } else {
                alert('Campaign saved as draft!')
            }

            router.push(`/dashboard/websites/${websiteId}/campaigns`)
        } catch (err) {
            setError('An error occurred')
        } finally {
            setSubmitting(false)
        }
    }

    const toggleSegment = (segmentId: string) => {
        setSelectedSegments(prev =>
            prev.includes(segmentId)
                ? prev.filter(id => id !== segmentId)
                : [...prev, segmentId]
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Campaign</h1>
                    <p className="text-gray-500 mt-1">
                        Sending for <span className="font-semibold text-gray-900">{websiteName || '...'}</span>
                    </p>
                </div>
                <Link
                    href={`/dashboard/websites/${websiteId}/campaigns`}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                    Cancel
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <form className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Content</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                maxLength={50}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="e.g. Flash Sale! 50% Off"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Body *
                            </label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                required
                                maxLength={120}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="e.g. Don't miss out on our biggest sale of the year. Shop now!"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Link URL (optional)
                                </label>
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Icon URL (optional)
                                </label>
                                <input
                                    type="url"
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Targeting</h3>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Segments (optional)
                        </label>

                        {segments.length === 0 ? (
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                                <p className="text-gray-500 text-sm">No segments found for this website.</p>
                                <Link href={`/dashboard/websites/${websiteId}/segments`} className="text-indigo-600 text-sm font-medium hover:underline mt-1 inline-block">
                                    Create a segment
                                </Link>
                            </div>
                        ) : (
                            <>
                                <p className="text-xs text-gray-500 mb-3">
                                    Leave unselected to send to all subscribers
                                </p>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {segments.map((segment) => (
                                        <label
                                            key={segment.id}
                                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedSegments.includes(segment.id)}
                                                onChange={() => toggleSegment(segment.id)}
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{segment.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {segment._count.subscribers} subscribers
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Schedule (optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={scheduledFor}
                            onChange={(e) => setScheduledFor(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave blank to send immediately or save as draft</p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={(e) => handleSubmit(e, 'sent')}
                            disabled={submitting || !!scheduledFor}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Processing...' : 'Send Now'}
                        </button>

                        {scheduledFor && (
                            <button
                                onClick={(e) => handleSubmit(e, 'scheduled')}
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-all shadow-md disabled:opacity-50"
                            >
                                Schedule Campaign
                            </button>
                        )}

                        <button
                            onClick={(e) => handleSubmit(e, 'draft')}
                            disabled={submitting}
                            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Save Draft
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function NewCampaignPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>}>
            <CampaignForm />
        </Suspense>
    )
}
