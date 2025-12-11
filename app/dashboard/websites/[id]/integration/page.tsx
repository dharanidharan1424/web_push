import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import CopyButton from '@/components/copy-button'
import Link from 'next/link'

export default async function IntegrationPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const { id } = await params

    // Validate access
    const website = await db.website.findFirst({
        where: { id, userId: session.user.id },
        select: { id: true, name: true }
    })

    if (!website) redirect('/dashboard/websites')

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">
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
    )
}
