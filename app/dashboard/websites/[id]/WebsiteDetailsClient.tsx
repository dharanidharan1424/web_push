'use client'

import { useState } from 'react'
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
    }
    appUrl: string
}

export default function WebsiteDetailsClient({ website, appUrl }: WebsiteDetailsClientProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'integration'>('overview')

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
                                                    {new Date(subscriber.createdAt).toLocaleString()}
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
                                                {new Date(notification.createdAt).toLocaleDateString()}
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
            ) : (
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
            )}
        </div>
    )
}
