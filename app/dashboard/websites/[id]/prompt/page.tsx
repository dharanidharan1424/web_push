import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import PromptSettingsClient from './PromptSettingsClient'

export default async function PromptPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const { id } = await params

    // Fetch prompt settings
    const website = await db.website.findFirst({
        where: { id, userId: session.user.id },
        select: {
            id: true,
            promptEnabled: true,
            promptTitle: true,
            promptMessage: true,
            promptAllowText: true,
            promptDenyText: true,
            promptPosition: true,
        }
    })

    if (!website) redirect('/dashboard/websites')

    const initialSettings = {
        promptEnabled: website.promptEnabled || false,
        promptTitle: website.promptTitle || '',
        promptMessage: website.promptMessage || '',
        promptAllowText: website.promptAllowText || '',
        promptDenyText: website.promptDenyText || '',
        promptPosition: website.promptPosition || 'center',
    }

    return <PromptSettingsClient websiteId={website.id} initialSettings={initialSettings} />
}
