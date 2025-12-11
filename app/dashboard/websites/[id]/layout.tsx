import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import WebsiteHeader from '@/components/WebsiteHeader'

export default async function WebsiteLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
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
            _count: {
                select: { subscribers: true },
            },
        },
    })

    if (!website) {
        redirect('/dashboard/websites')
    }

    return (
        <div className="space-y-0">
            <WebsiteHeader
                website={{
                    id: website.id,
                    name: website.name,
                    url: website.url,
                    verified: website._count.subscribers > 0, // Consider verified if has subscribers
                }}
                subscriberCount={website._count.subscribers}
            />
            <div className="p-6">{children}</div>
        </div>
    )
}
