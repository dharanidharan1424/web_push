'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import CopyButton from '@/components/copy-button'

interface WebsiteDetailsClientProps {
    website: {
        id: string
        name: string
        url: string
        _count: {
            subscribers: number
            notifications: number
        }
        subscribers: any[]
        notifications: any[]
        promptEnabled: boolean
        promptTitle: string
        promptMessage: string
        promptAllowText: string
        promptDenyText: string
        promptPosition: string
    }
    appUrl: string
}

export default function WebsiteDetailsClient({ website, appUrl }: WebsiteDetailsClientProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'integration' | 'prompt'>('overview')
    const [promptSettings, setPromptSettings] = useState({
        promptEnabled: website.promptEnabled,
        promptTitle: website.promptTitle,
        promptMessage: website.promptMessage,
        promptAllowText: website.promptAllowText,
        promptDenyText: website.promptDenyText,
        promptPosition: website.promptPosition,
    })
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    // Unsubscribe metrics state
    const [unsubscribeMetrics, setUnsubscribeMetrics] = useState({ totalSubscribers: 0, totalUnsubscribed: 0, unsubscribeRate: 0 })
    // Fetch metrics on mount / website change
    useEffect(() => {
        if (!website?.id) return
        const fetchMetrics = async () => {
            try {
                const res = await fetch(`/api/metrics/unsubscribe?websiteId=${website.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setUnsubscribeMetrics(data)
                }
            } catch (e) {
                console.error('Failed to load unsubscribe metrics', e)
            }
        }
        fetchMetrics()
    }, [website?.id])

    const handleSavePromptSettings = async () => {
        setSaving(true)
        setSaveSuccess(false)
        try {
            const response = await fetch(`/api/websites/${website.id}/update-prompt`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promptSettings),
            })
            if (response.ok) {
                setSaveSuccess(true)
                setTimeout(() => setSaveSuccess(false), 3000)
            }
        } catch (error) {
            console.error('Error saving prompt settings:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/dashboard/websites" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-4 transition-colors text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Websites
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">{website.name}</h1>
                    <a href={website.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1 mt-1">
                        {website.url}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/dashboard/notifications/new?websiteId=${website.id}`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
                    >
                        Send Notification
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('integration')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'integration'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Integration
                    </button>
                    <button
                        onClick={() => setActiveTab('prompt')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'prompt'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Permission Prompt
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' ? (
                <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Subscribers</p>
                            <p className="text-3xl font-bold text-gray-900">{website._count.subscribers}</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <p className="text-sm font-medium text-gray-500 mb-1">Notifications Sent</p>
                            <p className="text-3xl font-bold text-gray-900">{website._count.notifications}</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <p className="text-sm font-medium text-gray-500 mb-1">Active Subscribers</p>
                            <p className="text-3xl font-bold text-gray-900">{website.subscribers.length}</p>
                        </div>
                    </div>

                    {/* Recent Subscribers */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Recent Subscribers</h2>
                        </div>
                        {website.subscribers.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Subscribed At
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User Agent
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {website.subscribers.map((subscriber: any) => (
                                            <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(subscriber.createdAt).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                        hour12: true
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                                                    {subscriber.userAgent || 'Unknown'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center text-gray-500">
                                No subscribers yet. Install the script on your website to start collecting subscribers.
                            </div>
                        )}
                    </div>

                    {/* Unsubscribe Metrics */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Unsubscribe Metrics</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-2">
                                Total Subscribers: <strong>{unsubscribeMetrics.totalSubscribers}</strong>
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                                Unsubscribed: <strong>{unsubscribeMetrics.totalUnsubscribed}</strong>
                            </p>
                            <p className="text-sm text-gray-600">
                                Unsubscribe Rate: <strong>{unsubscribeMetrics.unsubscribeRate}%</strong>
                            </p>
                        </div>
                    </div>
                    {/* Recent Notifications */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Recent Notifications</h2>
                        </div>
                        {website.notifications.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {website.notifications.map((notification: any) => (
                                    <div key={notification.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
                                            </div>
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                            <span>Sent to {notification.sentCount} subscribers</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center text-gray-500">
                                No notifications sent yet.
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === 'integration' ? (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Installation Script</h2>
                        <p className="text-gray-600 mb-4">
                            Copy and paste this script tag into the <code className="bg-gray-100 px-2 py-1 rounded text-gray-800 border border-gray-200">&lt;head&gt;</code> section of your website:
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto border border-gray-200 mb-4">
                            <code className="text-sm text-gray-800 font-mono whitespace-nowrap">
                                {`<script src="${appUrl}/push-client.js" data-website-id="${website.id}" data-api-url="${appUrl}"></script>`}
                            </code>
                        </div>
                        <CopyButton text={`<script src="${appUrl}/push-client.js" data-website-id="${website.id}" data-api-url="${appUrl}"></script>`} />
                    </div>

                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
                        <p className="text-blue-700 text-sm mb-4">
                            Check out our documentation for detailed instructions on how to integrate WebPush with your specific platform (WordPress, Shopify, Custom, etc.).
                        </p>
                        <Link href="/help" className="text-sm font-medium text-blue-600 hover:text-blue-800 underline">
                            View Documentation &rarr;
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Custom Permission Prompt</h2>
                        <p className="text-gray-600 mb-6">
                            Configure a custom popup that appears before the browser's native permission request. This significantly improves opt-in rates.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="promptEnabled"
                                    checked={promptSettings.promptEnabled}
                                    onChange={(e) => setPromptSettings({ ...promptSettings, promptEnabled: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="promptEnabled" className="text-sm font-medium text-gray-700">
                                    Enable custom permission prompt
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Title</label>
                                <input
                                    type="text"
                                    value={promptSettings.promptTitle}
                                    onChange={(e) => setPromptSettings({ ...promptSettings, promptTitle: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Stay Updated!"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Message</label>
                                <textarea
                                    value={promptSettings.promptMessage}
                                    onChange={(e) => setPromptSettings({ ...promptSettings, promptMessage: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Get notifications about our latest updates and offers"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Allow Button Text</label>
                                    <input
                                        type="text"
                                        value={promptSettings.promptAllowText}
                                        onChange={(e) => setPromptSettings({ ...promptSettings, promptAllowText: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Allow"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Deny Button Text</label>
                                    <input
                                        type="text"
                                        value={promptSettings.promptDenyText}
                                        onChange={(e) => setPromptSettings({ ...promptSettings, promptDenyText: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Maybe Later"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Position</label>
                                <select
                                    value={promptSettings.promptPosition}
                                    onChange={(e) => setPromptSettings({ ...promptSettings, promptPosition: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="center">Center</option>
                                    <option value="bottom-left">Bottom Left</option>
                                    <option value="bottom-right">Bottom Right</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    onClick={handleSavePromptSettings}
                                    disabled={saving}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Settings'}
                                </button>
                                {saveSuccess && (
                                    <span className="text-green-600 text-sm font-medium">✓ Saved successfully!</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Pro Tip</h3>
                        <p className="text-blue-700 text-sm">
                            Custom permission prompts can increase opt-in rates by up to 300%! Make sure your message clearly explains the value users will get from subscribing.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
