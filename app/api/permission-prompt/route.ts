import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const websiteId = searchParams.get('websiteId')

        if (!websiteId) {
            return NextResponse.json({ error: 'Website ID is required' }, { status: 400 })
        }

        const website = await db.website.findUnique({
            where: { id: websiteId },
            select: {
                promptEnabled: true,
                promptTitle: true,
                promptMessage: true,
                promptAllowText: true,
                promptDenyText: true,
                promptPosition: true,
            },
        })

        if (!website) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 })
        }

        return NextResponse.json({
            enabled: website.promptEnabled,
            title: website.promptTitle,
            message: website.promptMessage,
            allowText: website.promptAllowText,
            denyText: website.promptDenyText,
            position: website.promptPosition,
        })
    } catch (error) {
        console.error('Error fetching permission prompt settings:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
