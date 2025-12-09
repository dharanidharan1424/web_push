'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import CopyButton from '@/components/copy-button'

interface Segment {
    id: string
    name: string
    description: string | null
    createdAt: string
    _count: {
        subscribers: number
    }
}

export default function WebsiteSegmentsPage() {
    const params = useParams()
    const websiteId = params?.id as string

    const [segments, setSegments] = useState<Segment[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [newName, setNewName] = useState('')
    const [newDesc, setNewDesc] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (websiteId) {
            fetchSegments()
        }
    }, [websiteId])

    const fetchSegments = async () => {
        try {
            const res = await fetch(`/api/segments?websiteId=${websiteId}`)
            const data = await res.json()
            setSegments(data.segments || [])
        } catch (err) {
            console.error('Error fetching segments:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await fetch('/api/segments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    description: newDesc,
                    websiteId
                })
            })
            if (res.ok) {
                setShowCreate(false)
                setNewName('')
                setNewDesc('')
                fetchSegments()
            }
        } catch (err) {
            console.error('Error creating segment:', err)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this segment?')) return

        try {
            await fetch(`/api/segments/${id}`, { method: 'DELETE' })
            fetchSegments()
        } catch (err) {
            console.error('Error deleting segment:', err)
        }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const scriptTag = `<script src="${appUrl}/push-client.js" data-website-id="${websiteId}" data-api-url="${appUrl}"></script>`

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Segments</h1>
                    <p className="text-gray-500 mt-1">Group subscribers for targeted campaigns.</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm text-sm"
                >
                    {showCreate ? 'Cancel' : 'Create Segment'}
                </button>
            </div>

            {/* Integration Script Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Installation Script</h2>
                <p className="text-gray-600 mb-4 text-sm">
                    Copy and paste this script tag into the <code className="bg-gray-100 px-2 py-1 rounded text-gray-800 border border-gray-200">&lt;head&gt;</code> section of your website to enable web push notifications:
                </p>
                <div className="bg-gray-900 rounded-lg p-4 relative group">
                    <code className="text-gray-100 text-sm break-all font-mono block pr-12">
                        {scriptTag}
                    </code>
                    <div className="absolute top-4 right-4">
                        <CopyButton text={scriptTag} />
                    </div>
                </div>
            </div>

            {showCreate && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">New Segment</h3>
                    <form onSubmit={handleCreate} className="max-w-md space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g. Premium Users"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <input
                                type="text"
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Optional description"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {submitting ? 'Creating...' : 'Save Segment'}
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">Loading...</div>
                ) : segments.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {segments.map((segment) => (
                            <div key={segment.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{segment.name}</h3>
                                    {segment.description && <p className="text-gray-500 text-sm mt-1">{segment.description}</p>}
                                    <p className="text-xs text-indigo-600 font-medium mt-2">{segment._count.subscribers} subscribers</p>
                                </div>
                                <div className="flex actions gap-2">
                                    {/* Add logic to view subscribers in segment here if needed */}
                                    <button
                                        onClick={() => handleDelete(segment.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete Segment"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        No segments found.
                    </div>
                )}
            </div>
        </div>
    )
}
