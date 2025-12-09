'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import CopyButton from '@/components/copy-button'

export default function IntegrationPage() {
    const params = useParams()
    const websiteId = params.id as string
    const [loading, setLoading] = useState(true)
    const [website, setWebsite] = useState<any>(null)

    useEffect(() => {
        if (websiteId) {
            fetchWebsite()
        }
    }, [websiteId])

    const fetchWebsite = async () => {
        try {
            const res = await fetch(`/api/websites/${websiteId}`)
            const data = await res.json()
            setWebsite(data.website)
        } catch (err) {
            console.error('Error fetching website:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    const scriptTag = `<script src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/push-client.js" data-website-id="${websiteId}" data-api-url="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}"></script>`

    return (
        <div className="max-w-3xl space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Integration</h2>
                <p className="text-gray-500 mt-1">Install the push notification script on your website.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">1. Add the Script</h3>
                <p className="text-gray-600 mb-4">
                    Copy and paste the following code snippet into the <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">&lt;head&gt;</code> tag of your website.
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">2. Verify Installation</h3>
                <p className="text-gray-600 mb-4">
                    After adding the script, visit your website and check if the browser asks for notification permission.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg border border-green-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Status: {website?.verified ? 'Verified' : 'Pending Verification'}
                </div>
            </div>
        </div>
    )
}
