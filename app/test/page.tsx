'use client'

import Script from 'next/script'

export default function TestPage() {
    const handleSubscribe = () => {
        if (typeof window !== 'undefined' && (window as any).webPushSubscribe) {
            (window as any).webPushSubscribe();
        }
    }

    const handleJoinSegment = async () => {
        // Hardcoded segment ID for testing
        const segmentId = 'cmivqztz3000w115stz4fvyto';

        if (typeof window !== 'undefined' && (window as any).webPushAddToSegment) {
            try {
                const result = await (window as any).webPushAddToSegment(segmentId);
                if (result) {
                    alert('Successfully added to segment!');
                } else {
                    alert('Failed to add to segment. Please check the console (F12) for errors.');
                }
            } catch (e) {
                console.error(e);
                alert('An error occurred: ' + e);
            }
        } else {
            alert('Web Push client script not loaded yet. Please refresh the page.');
        }
    }

    return (
        <>
            <Script
                src="http://localhost:3000/push-client.js"
                data-website-id="cmiy1wsy60001p9yeeq2aq4yl"
                data-api-url="http://localhost:3000"
                strategy="afterInteractive"
            />

            <div style={{ padding: '40px', fontFamily: 'Arial' }}>
                <h1>Web Push Notification Test</h1>
                <p>Open the browser console (F12) to see what&apos;s happening.</p>
                <p>After 2 seconds, you should see a notification permission prompt.</p>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button
                        onClick={handleSubscribe}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Manual Subscribe
                    </button>

                    <button
                        onClick={handleJoinSegment}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Join Segment
                    </button>
                </div>
            </div>
        </>
    )
}
