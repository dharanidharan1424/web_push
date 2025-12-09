import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updatePromptSchema = z.object({
    promptEnabled: z.boolean().optional(),
    promptTitle: z.string().min(1).optional(),
    promptMessage: z.string().min(1).optional(),
    promptAllowText: z.string().min(1).optional(),
    promptDenyText: z.string().min(1).optional(),
    promptPosition: z.enum(['center', 'bottom-left', 'bottom-right']).optional(),
})

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const validatedData = updatePromptSchema.parse(body)

        // Verify website ownership
        const website = await db.website.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        })

        if (!website) {
            return NextResponse.json({ error: 'Website not found' }, { status: 404 })
        }

        // Update prompt settings
        const updatedWebsite = await db.website.update({
            where: { id },
            data: validatedData,
            select: {
                promptEnabled: true,
                promptTitle: true,
                promptMessage: true,
                promptAllowText: true,
                promptDenyText: true,
                promptPosition: true,
            },
        })

        return NextResponse.json({
            message: 'Prompt settings updated successfully',
            settings: updatedWebsite,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
        }

        console.error('Error updating prompt settings:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
