import Link from 'next/link'
import PricingClient from './PricingClient'

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            P
                        </div>
                        <span className="text-xl font-bold text-gray-900">Pushify</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                            Log in
                        </Link>
                        <Link href="/signup" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            <main className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
                    <p className="text-xl text-gray-600">
                        Choose the plan that fits your needs. No hidden fees, cancel anytime.
                    </p>
                </div>

                <PricingClient />
            </main>

            <footer className="bg-white border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                    <p>&copy; 2024 Pushify. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
