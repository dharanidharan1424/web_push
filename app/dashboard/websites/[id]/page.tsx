import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import WebsiteDetailsClient from './WebsiteDetailsClient'

export default async function WebsiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    const { id } = await params

    const website = await db.website.findFirst({
        where: {
            id: id,
            userId: session.user.id,
        },
        include: {
            subscribers: {
                orderBy: { createdAt: 'desc' },
                take: 50,
            },
            notifications: {
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
            _count: {
                select: { subscribers: true, notifications: true },
            },
        },
    })

    if (!website) {
        redirect('/dashboard/websites')
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    return <WebsiteDetailsClient website={website} appUrl={appUrl} />
}
