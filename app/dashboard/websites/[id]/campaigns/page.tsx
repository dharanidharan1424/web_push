import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'

export default async function WebsiteCampaignsPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ status?: string }> }) {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    const { id: websiteId } = await params
    const { status = 'sent' } = await searchParams
    const currentStatus = status as string

    // Verify ownership
    const website = await db.website.findFirst({
        where: {
            id: websiteId,
            userId: session.user.id
        }
    })

    if (!website) {
        redirect('/dashboard/websites')
    }

    const notifications = await db.notification.findMany({
        where: {
            websiteId: websiteId,
            status: currentStatus
        },
        include: {
            website: true
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 50
    })

    const tabs = [
        { id: 'sent', label: 'Sent' },
        { id: 'draft', label: 'Drafts' },
        { id: 'scheduled', label: 'Scheduled' },
        { id: 'failed', label: 'Failed' },
    ]

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
                    <p className="text-gray-500 mt-1">Manage campaigns for {website.name}.</p>
                </div>
                <Link
                    href={`/dashboard/websites/${websiteId}/campaigns/new`}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm text-sm"
                >
                    Create Campaign
                </Link>
            </div>

            {/* Campaign Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Sent</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                        {notifications.reduce((acc, n) => acc + (n.sentCount || 0), 0).toLocaleString()}
                    </h3>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Avg Open Rate</p>
                    <h3 className="text-2xl font-bold text-gray-900">18.2%</h3>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-2 inline-block">Est.</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Avg Click Rate</p>
                    <h3 className="text-2xl font-bold text-gray-900">2.4%</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-2 inline-block">Industry Avg</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.id}
                            href={`/dashboard/websites/${websiteId}/campaigns?status=${tab.id}`}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${currentStatus === tab.id
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                            <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{notification.title}</h3>
                                        <p className="text-gray-600 mt-1">{notification.body}</p>
                                    </div>
                                    <span className="text-xs text-gray-500 whitespace-nowrap bg-gray-100 px-2 py-1 rounded-full">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="flex items-center gap-6 mt-4 text-sm">
                                    {currentStatus === 'sent' && (
                                        <div className="flex items-center gap-2 text-green-600 font-medium">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {notification.sentCount} sent
                                        </div>
                                    )}

                                    {currentStatus === 'scheduled' && notification.scheduledFor && (
                                        <div className="flex items-center gap-2 text-amber-600 font-medium">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Scheduled for {new Date(notification.scheduledFor).toLocaleString()}
                                        </div>
                                    )}

                                    {notification.url && (
                                        <a href={notification.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors ml-auto">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            View Link
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No {currentStatus} campaigns</h3>
                        <p className="text-gray-500 mb-6">
                            {currentStatus === 'sent'
                                ? "You haven't sent any campaigns yet."
                                : `You don't have any ${currentStatus} campaigns.`}
                        </p>
                        <Link
                            href={`/dashboard/websites/${websiteId}/campaigns/new`}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-block"
                        >
                            Create Campaign
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
