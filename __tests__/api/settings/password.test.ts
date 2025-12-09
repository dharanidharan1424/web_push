import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/settings/password/route'
import { createMocks } from 'node-mocks-http'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/auth', () => ({
    auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
    db: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}))

vi.mock('@/lib/auth', () => ({
    verifyPassword: vi.fn(),
    hashPassword: vi.fn(),
}))

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { verifyPassword, hashPassword } from '@/lib/auth'

describe('Password Change API', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('should return 401 if not authenticated', async () => {
        (auth as any).mockResolvedValue(null)

        const req = new NextRequest('http://localhost/api/settings/password', {
            method: 'POST',
            body: JSON.stringify({
                currentPassword: 'oldpassword',
                newPassword: 'newpassword',
                confirmPassword: 'newpassword',
            }),
        })

        const res = await POST(req)
        expect(res.status).toBe(401)
    })

    it('should return 400 if validation fails', async () => {
        (auth as any).mockResolvedValue({ user: { id: 'user1' } })

        const req = new NextRequest('http://localhost/api/settings/password', {
            method: 'POST',
            body: JSON.stringify({
                currentPassword: 'old',
                newPassword: 'short', // too short
                confirmPassword: 'short',
            }),
        })

        const res = await POST(req)
        expect(res.status).toBe(400)
    })

    it('should return 400 if current password is incorrect', async () => {
        (auth as any).mockResolvedValue({ user: { id: 'user1' } })
            ; (db.user.findUnique as any).mockResolvedValue({
                id: 'user1',
                password: 'hashed_old_password',
            })
            ; (verifyPassword as any).mockResolvedValue(false)

        const req = new NextRequest('http://localhost/api/settings/password', {
            method: 'POST',
            body: JSON.stringify({
                currentPassword: 'wrongpassword',
                newPassword: 'newpassword123',
                confirmPassword: 'newpassword123',
            }),
        })

        const res = await POST(req)
        expect(res.status).toBe(400)
        const data = await res.json()
        expect(data.error).toBe('Incorrect current password')
    })

    it('should update password if all checks pass', async () => {
        (auth as any).mockResolvedValue({ user: { id: 'user1' } })
            ; (db.user.findUnique as any).mockResolvedValue({
                id: 'user1',
                password: 'hashed_old_password',
            })
            ; (verifyPassword as any).mockResolvedValue(true)
            ; (hashPassword as any).mockResolvedValue('hashed_new_password')
            ; (db.user.update as any).mockResolvedValue({ id: 'user1' })

        const req = new NextRequest('http://localhost/api/settings/password', {
            method: 'POST',
            body: JSON.stringify({
                currentPassword: 'oldpassword',
                newPassword: 'newpassword123',
                confirmPassword: 'newpassword123',
            }),
        })

        const res = await POST(req)
        expect(res.status).toBe(200)

        expect(db.user.update).toHaveBeenCalledWith({
            where: { id: 'user1' },
            data: { password: 'hashed_new_password' },
        })
    })
})
