import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

export default async function WebsiteLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const { id } = await params

    // Verify website ownership
    const website = await db.website.findFirst({
        where: {
            id,
            userId: session.user.id,
        },
        select: {
            id: true,
            name: true,
        },
    })

    if (!website) redirect('/dashboard/websites')

    const navItems = [
        { name: 'Overview', href: `/dashboard/websites/${id}` },
        { name: 'Subscribers', href: `/dashboard/websites/${id}/subscribers` },
        { name: 'Segments', href: `/dashboard/websites/${id}/segments` },
        { name: 'Campaigns', href: `/dashboard/websites/${id}/campaigns` },
        { name: 'Integration', href: `/dashboard/websites/${id}/integration` },
        { name: 'Settings', href: `/dashboard/websites/${id}/settings` },
    ]

    return (
        <div className="flex flex-col h-full">
            {/* Website Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xl">
                        {website.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{website.name}</h1>
                        <p className="text-sm text-gray-500">Website Management</p>
                    </div>
                </div>
                <Link href="/dashboard/websites" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                    &larr; Back to all websites
                </Link>
            </div>

            {/* Inner Navigation */}
            <div className="bg-white border-b border-gray-200 px-8">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-8">
                {children}
            </div>
        </div>
    )
}
