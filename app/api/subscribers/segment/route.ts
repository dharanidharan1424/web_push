import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const addToSegmentSchema = z.object({
    segmentId: z.string().min(1, 'Segment ID is required'),
    endpoint: z.string().min(1, 'Endpoint is required'),
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        console.log('Segment add request body:', body);
        const result = addToSegmentSchema.safeParse(body)

        if (!result.success) {
            console.log('Validation error:', result.error);
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            )
        }

        const { segmentId, endpoint } = result.data

        // Find subscriber by endpoint
        const subscriber = await db.subscriber.findUnique({
            where: { endpoint },
        })
        console.log('Found subscriber:', subscriber ? subscriber.id : 'null');

        if (!subscriber) {
            return NextResponse.json(
                { error: 'Subscriber not found. Please subscribe to notifications first.' },
                { status: 404 }
            )
        }

        // Verify segment exists
        const segment = await db.segment.findUnique({
            where: { id: segmentId },
        })
        console.log('Found segment:', segment ? segment.id : 'null');

        if (!segment) {
            return NextResponse.json(
                { error: 'Segment not found' },
                { status: 404 }
            )
        }

        // Add subscriber to segment
        const subSeg = await db.subscriberSegment.create({
            data: {
                subscriberId: subscriber.id,
                segmentId: segment.id,
            },
        })
        console.log('Created subscriber segment:', subSeg);

        return NextResponse.json(
            { message: 'Successfully added to segment' },
            { status: 200 }
        )

    } catch (error: any) {
        // Check for unique constraint violation (already in segment)
        if (error.code === 'P2002') {
            console.log('Already in segment');
            return NextResponse.json(
                { message: 'Already in segment' },
                { status: 200 }
            )
        }

        console.error('Error adding to segment:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
