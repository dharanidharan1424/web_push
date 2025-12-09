'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Website {
    id: string
    name: string
}

interface Segment {
    id: string
    name: string
    _count: {
        subscribers: number
    }
}

function CampaignForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const preselectedWebsiteId = searchParams.get('websiteId')

    const [websites, setWebsites] = useState<Website[]>([])
    const [segments, setSegments] = useState<Segment[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const [websiteId, setWebsiteId] = useState(preselectedWebsiteId || '')
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [url, setUrl] = useState('')
    const [icon, setIcon] = useState('')
    const [selectedSegments, setSelectedSegments] = useState<string[]>([])
    const [scheduledFor, setScheduledFor] = useState('')

    useEffect(() => {
        fetchWebsites()
    }, [])

    useEffect(() => {
        setSegments([])
        setSelectedSegments([])
        if (websiteId) {
            fetchSegments(websiteId)
        }
    }, [websiteId])

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

            router.push('/dashboard/campaigns')
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* ... header ... */}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <form className="space-y-6">
                    {/* ... error ... */}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Website *
                        </label>
                        <select
                            value={websiteId}
                            onChange={(e) => setWebsiteId(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="">Select a website</option>
                            {websites.map((website) => (
                                <option key={website.id} value={website.id}>
                                    {website.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ... title, message, url, icon inputs ... */}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Segments (optional)
                        </label>
                        {!websiteId ? (
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                                <p className="text-gray-500 text-sm">Select a website to view available segments.</p>
                            </div>
                        ) : segments.length === 0 ? (
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
