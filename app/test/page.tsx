'use client'

import Script from 'next/script'

export default function TestPage() {
    return (
        <>
            <script src="https://web-push-eight-hazel.vercel.app/push-client.js" data-website-id="cmiyhd90f000beup7rf8vlg42" data-api-url="https://web-push-eight-hazel.vercel.app"></script>

            <div style={{ padding: '40px', fontFamily: 'Arial' }}>
                <h1>Web Push Notification Test</h1>
                <p>Open the browser console (F12) to see what&apos;s happening.</p>
                <p>After 2 seconds, you should see a custom permission prompt.</p>
                <p>Click &quot;Allow&quot; on the custom popup, then grant browser permission.</p>

                <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>Expected Flow:</h2>
                    <ol style={{ margin: 0, paddingLeft: '20px' }}>
                        <li>Custom popup appears (2 seconds after page load)</li>
                        <li>Click &quot;Allow&quot; on custom popup</li>
                        <li>Browser permission dialog appears</li>
                        <li>Grant browser permission</li>
                        <li>Check dashboard - subscriber count should increase</li>
                    </ol>
                </div>

                <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#92400e' }}>Check Console Logs:</h2>
                    <p style={{ margin: 0, fontSize: '14px', color: '#78350f' }}>
                        You should see logs showing the subscription process. If there are errors, copy them and report back.
                    </p>
                </div>
            </div>
        </>
    )
}
