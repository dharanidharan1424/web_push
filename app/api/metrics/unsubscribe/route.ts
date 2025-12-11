import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const websiteId = searchParams.get('websiteId')
        if (!websiteId) {
            return NextResponse.json({ error: 'websiteId query param required' }, { status: 400 })
        }

        const totalSubscribers = await db.subscriber.count({ where: { websiteId } })
        const totalUnsubscribed = 0; // Schema update required to track status

        const unsubscribeRate = totalSubscribers + totalUnsubscribed === 0
            ? 0
            : (totalUnsubscribed / (totalSubscribers + totalUnsubscribed)) * 100

        return NextResponse.json({
            totalSubscribers,
            totalUnsubscribed,
            unsubscribeRate: Number(unsubscribeRate.toFixed(2)),
        })
    } catch (error) {
        console.error('Error fetching unsubscribe metrics:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
