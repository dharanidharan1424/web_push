'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import Script from 'next/script'

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function PricingClient() {
    const { data: session } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleUpgrade = async (plan: string) => {
        if (!session) {
            router.push('/signup?plan=' + plan)
            return
        }

        if (loading) return
        setLoading(true)

        try {
            // Create Order
            const res = await fetch('/api/user/plan/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan }),
            })

            const data = await res.json()

            if (!res.ok) {
                alert(data.error || 'Failed to create order')
                setLoading(false)
                return
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
                amount: data.amount,
                currency: data.currency,
                name: "WebPush",
                description: `Upgrade to ${plan} Plan`,
                order_id: data.orderId,
                handler: async function (response: any) {
                    // Verify Payment
                    try {
                        const verifyRes = await fetch('/api/user/plan/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                plan: plan
                            }),
                        })

                        if (verifyRes.ok) {
                            alert('Payment Successful! Plan upgraded.')
                            window.location.href = '/dashboard/settings'
                        } else {
                            alert('Payment Verification Failed')
                        }
                    } catch (err) {
                        console.error(err)
                        alert('Payment Verification Failed')
                    }
                },
                prefill: {
                    name: session.user?.name,
                    email: session.user?.email,
                },
                theme: {
                    color: "#4F46E5"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                alert(response.error.description);
            });
            rzp1.open();
        } catch (err) {
            console.error(err)
            alert('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                {/* Free Plan */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Free</h3>
                        <p className="text-gray-500 mt-1">Perfect for getting started</p>
                    </div>
                    <div className="mb-6">
                        <span className="text-4xl font-bold text-gray-900">$0</span>
                        <span className="text-gray-500">/month</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            1 Website
                        </li>
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            100 Subscribers
                        </li>
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            2 Campaigns / month
                        </li>
                        <li className="flex items-center gap-3 text-gray-400">
                            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            No Segments
                        </li>
                    </ul>
                    <button disabled className="block w-full py-3 px-6 text-center bg-gray-100 text-gray-500 font-medium rounded-xl cursor-default">
                        Current Plan (if free)
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-600 p-8 flex flex-col relative transform hover:scale-105 transition-transform duration-200">
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                        POPULAR
                    </div>
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Pro</h3>
                        <p className="text-gray-500 mt-1">For growing businesses</p>
                    </div>
                    <div className="mb-6">
                        <span className="text-4xl font-bold text-gray-900">$29</span>
                        <span className="text-gray-500">/month</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            1 Website
                        </li>
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            1,000 Subscribers
                        </li>
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            10 Campaigns / month
                        </li>
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Up to 10 Segments
                        </li>
                    </ul>
                    <button
                        onClick={() => handleUpgrade('PRO')}
                        className="block w-full py-3 px-6 text-center bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
                    >
                        {session ? (loading ? 'Processing...' : 'Upgrade Now') : 'Get Started'}
                    </button>
                </div>

                {/* Agency Plan */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Agency</h3>
                        <p className="text-gray-500 mt-1">For large scale needs</p>
                    </div>
                    <div className="mb-6">
                        <span className="text-4xl font-bold text-gray-900">$99</span>
                        <span className="text-gray-500">/month</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Multiple Websites
                        </li>
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Higher Subscriber Limits
                        </li>
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Scheduled Campaigns
                        </li>
                        <li className="flex items-center gap-3 text-gray-600">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Team Access & White-label
                        </li>
                    </ul>
                    <button
                        onClick={() => handleUpgrade('AGENCY')}
                        className="block w-full py-3 px-6 text-center bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        {session ? (loading ? 'Processing...' : 'Upgrade Now') : 'Contact Sales'}
                    </button>
                </div>
            </div>
        </>
    )
}
