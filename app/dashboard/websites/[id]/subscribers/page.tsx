import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

export default async function WebsiteSubscribersPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    const { id: websiteId } = await params

    const website = await db.website.findFirst({
        where: {
            id: websiteId,
            userId: session.user.id
        }
    })

    if (!website) {
        redirect('/dashboard/websites')
    }

    const subscribers = await db.subscriber.findMany({
        where: {
            websiteId: websiteId
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 100 // Pagination later if needed
    })

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Subscribers</h1>
                    <p className="text-gray-500 mt-1">View and manage subscribers for {website.name}.</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium">
                    Total: {subscribers.length}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {subscribers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Subscribed At
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User Agent
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {subscribers.map((subscriber) => (
                                    <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {subscriber.id.slice(0, 8)}...
                                        </td>
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
                    <div className="p-12 text-center text-gray-500">
                        No subscribers yet.
                    </div>
                )}
            </div>
        </div>
    )
}
