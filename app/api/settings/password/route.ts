import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { verifyPassword, hashPassword } from '@/lib/auth';
import { z } from 'zod';

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Validate input
        const result = passwordSchema.safeParse(body);
        if (!result.success) {
            const errorMessage = result.error.issues[0]?.message || 'Validation error';
            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        const { currentPassword, newPassword } = result.data;

        const user = await db.user.findUnique({ where: { id: session.user.id } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const passwordMatches = await verifyPassword(currentPassword, user.password);
        if (!passwordMatches) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        const hashed = await hashPassword(newPassword);
        await db.user.update({ where: { id: user.id }, data: { password: hashed } });

        return NextResponse.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
