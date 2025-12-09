'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
})

type PasswordFormData = z.infer<typeof passwordSchema>

export default function SettingsPage() {
    const { data: session } = useSession()
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing' | 'api'>('profile')

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-500 mt-1">Manage your profile, security, and billing preferences.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <nav className="w-full md:w-64 flex-shrink-0 space-y-1">
                    {[
                        { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                        { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                        { id: 'billing', label: 'Billing & Plan', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                        { id: 'api', label: 'API Keys', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 16.25a1 1 0 01-.17.265l-2.5 2.5a1 1 0 01-1.414 0l-2.5-2.5a1 1 0 010-1.414l2.5-2.5a1 1 0 01.265-.17L12.743 9.257A6 6 0 1021 9z' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Content Area */}
                <div className="flex-1">
                    {activeTab === 'profile' && <ProfileSection session={session} />}
                    {activeTab === 'security' && <SecuritySection />}
                    {activeTab === 'billing' && <BillingSection />}
                    {activeTab === 'api' && <ApiSection />}
                </div>
            </div>
        </div>
    )
}

function ProfileSection({ session }: { session: any }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Information</h2>
            <div className="space-y-6 max-w-md">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        defaultValue={session?.user?.name || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        defaultValue={session?.user?.email || ''}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email address cannot be changed.</p>
                </div>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm">
                    Save Changes
                </button>
            </div>
        </div>
    )
}

function SecuritySection() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) })

    const [message, setMessage] = useState('')

    const onSubmit = async (data: PasswordFormData) => {
        setMessage('')
        try {
            const res = await fetch('/api/settings/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                }),
            })
            const result = await res.json()
            if (res.ok) {
                setMessage('Password updated successfully')
                reset()
            } else {
                setMessage(result.error || 'Failed to update password')
            }
        } catch (e) {
            setMessage('Network error')
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Security Settings</h2>

            <div className="max-w-md">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>
                {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            {...register('currentPassword')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                        {errors.currentPassword && (
                            <p className="text-red-600 text-xs mt-1">{errors.currentPassword.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            {...register('newPassword')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                        {errors.newPassword && (
                            <p className="text-red-600 text-xs mt-1">{errors.newPassword.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            {...register('confirmPassword')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
                    >
                        {isSubmitting ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}


function BillingSection() {
    const [userPlan, setUserPlan] = useState('FREE')
    const [planLimits, setPlanLimits] = useState({ websites: 1, subscribers: 100 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPlanInfo()
    }, [])

    const fetchPlanInfo = async () => {
        try {
            const res = await fetch('/api/user/plan')
            if (res.ok) {
                const data = await res.json()
                setUserPlan(data.plan || 'FREE')
                setPlanLimits(data.limits || { websites: 1, subscribers: 100 })
            }
        } catch (err) {
            console.error('Error fetching plan info:', err)
        } finally {
            setLoading(false)
        }
    }

    // Plan details mapping
    const planDetails = {
        FREE: { name: 'Free Plan', description: 'Perfect for testing and small sites.', price: 0 },
        PRO: { name: 'Pro Plan', description: 'For growing businesses.', price: 900 },
        AGENCY: { name: 'Agency Plan', description: 'Unlimited everything.', price: 9900 }
    }

    const currentPlanDetails = planDetails[userPlan as keyof typeof planDetails] || planDetails.FREE
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Billing & Plan</h2>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                {/* Current Plan Card */}
                <div className="flex-1 p-6 border border-indigo-100 bg-indigo-50 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="inline-block px-3 py-1 bg-white text-indigo-700 text-xs font-bold rounded-full border border-indigo-100 mb-2">CURRENT PLAN</span>
                            <h3 className="text-xl font-bold text-indigo-900">{loading ? 'Loading...' : currentPlanDetails.name}</h3>
                            <p className="text-sm text-indigo-700 mt-1">{currentPlanDetails.description}</p>
                        </div>
                        <span className="text-2xl font-bold text-indigo-900">${loading ? '...' : (currentPlanDetails.price / 100).toFixed(0)}<span className="text-sm font-normal text-indigo-600">/mo</span></span>
                    </div>
                    <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-indigo-800">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            {planLimits.websites === Infinity ? 'Unlimited' : planLimits.websites} {planLimits.websites === 1 ? 'Website' : 'Websites'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-indigo-800">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            {planLimits.subscribers === Infinity ? 'Unlimited' : planLimits.subscribers} Subscribers
                        </div>
                    </div>
                    <Link href="/pricing" className="block w-full py-2 px-4 bg-indigo-600 text-white text-center rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                        Upgrade Plan
                    </Link>
                </div>

                {/* Upgrade Promo */}
                <div className="flex-1 p-6 border border-gray-200 rounded-xl flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Need more power?</h3>
                    <p className="text-gray-600 text-sm mb-4">
                        Upgrade to our <strong>Agency Plan</strong> to manage multiple websites, unlimited campaigns, and get priority support.
                    </p>
                    <Link href="/pricing" className="text-indigo-600 font-medium text-sm hover:text-indigo-800 flex items-center gap-1">
                        View All Plans <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-900">Payment Methods</h3>
                <p className="text-sm text-gray-500 italic">No payment methods added yet.</p>
                <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add Payment Method
                </button>
            </div>
        </div>
    )
}


function ApiSection() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-6">API Keys</h2>
            <p className="text-sm text-gray-600 mb-6">
                Use these keys to authenticate requests to the Web Push API. Do not share your private keys.
            </p>

            <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">Default API Key</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">pk_live_********************</p>
                    </div>
                    <button className="text-red-600 text-sm font-medium hover:text-red-700">
                        Revoke
                    </button>
                </div>

                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Generate New Key
                </button>
            </div>
        </div>
    )
}
