// Web Push Notification Client Script
(function () {
    'use strict';

    // Get configuration from script tag data attributes
    const scriptTag = document.currentScript;
    const websiteId = scriptTag.getAttribute('data-website-id');
    const apiUrl = scriptTag.getAttribute('data-api-url') || 'http://localhost:3000';

    if (!websiteId) {
        console.error('[WebPush] Missing data-website-id attribute');
        return;
    }

    // Check if service workers and push notifications are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('[WebPush] Push notifications are not supported in this browser');
        return;
    }

    // Check if already subscribed
    async function isSubscribed() {
        console.log('[WebPush] Checking if subscribed...');
        try {
            if (!('serviceWorker' in navigator)) {
                console.log('[WebPush] Service Worker not supported');
                return false;
            }
            console.log('[WebPush] Waiting for SW ready...');
            const registration = await navigator.serviceWorker.ready;
            console.log('[WebPush] SW ready, getting subscription...');
            const subscription = await registration.pushManager.getSubscription();
            console.log('[WebPush] Subscription status:', subscription ? 'active' : 'none');
            return subscription !== null;
        } catch (e) {
            console.error('[WebPush] Error checking subscription:', e);
            return false;
        }
    }

    // Request notification permission and subscribe
    async function subscribe() {
        try {
            console.log('[WebPush] Starting subscription process...');

            // Check if already subscribed to prevent duplicates
            const alreadySubscribed = await isSubscribed();
            if (alreadySubscribed) {
                console.log('[WebPush] Already subscribed, skipping');
                return true;
            }

            // Request permission
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                console.log('[WebPush] Notification permission denied');
                return false;
            }

            // Use existing service worker registration (DO NOT register again)
            console.log('[WebPush] Waiting for existing SW registration...');
            const registration = await navigator.serviceWorker.ready;
            console.log('[WebPush] Using existing SW registration');

            // Get VAPID public key
            const response = await fetch(`${apiUrl}/api/vapid-key`);
            const { publicKey } = await response.json();

            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });

            // Send subscription to server
            const subscribeResponse = await fetch(`${apiUrl}/api/subscribers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    websiteId,
                    subscription: subscription.toJSON(),
                    userAgent: navigator.userAgent,
                }),
            });

            if (subscribeResponse.ok) {
                console.log('[WebPush] Successfully subscribed to push notifications');
                return true;
            } else {
                console.error('[WebPush] Failed to register subscription with server');
                return false;
            }
        } catch (error) {
            console.error('[WebPush] Error subscribing to push notifications:', error);
            return false;
        }
    }

    // Helper function to convert VAPID key
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Show custom permission prompt
    async function showCustomPrompt() {
        return new Promise(async (resolve) => {
            try {
                // Fetch prompt settings from API
                const response = await fetch(`${apiUrl}/api/permission-prompt?websiteId=${websiteId}`);
                const settings = await response.json();

                if (!settings.enabled) {
                    // If custom prompt is disabled, directly request permission
                    resolve(true);
                    return;
                }

                // Create custom prompt overlay
                const overlay = document.createElement('div');
                overlay.id = 'webpush-custom-prompt';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: ${settings.position === 'center' ? 'center' : 'flex-end'};
                    justify-content: ${settings.position === 'bottom-right' ? 'flex-end' : settings.position === 'bottom-left' ? 'flex-start' : 'center'};
                    z-index: 999999;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                `;

                // Create prompt box
                const promptBox = document.createElement('div');
                promptBox.style.cssText = `
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    max-width: 400px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                    animation: slideIn 0.3s ease-out;
                `;

                // Add animation keyframes
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `;
                document.head.appendChild(style);

                // Create content
                promptBox.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 8px;">🔔</div>
                        <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                            ${settings.title}
                        </h3>
                        <p style="margin: 0 0 20px 0; font-size: 14px; color: #666; line-height: 1.5;">
                            ${settings.message}
                        </p>
                        <div style="display: flex; gap: 12px;">
                            <button id="webpush-deny" style="
                                flex: 1;
                                padding: 12px 20px;
                                border: 1px solid #ddd;
                                border-radius: 8px;
                                background: white;
                                color: #666;
                                font-size: 14px;
                                font-weight: 500;
                                cursor: pointer;
                                transition: all 0.2s;
                            ">${settings.denyText}</button>
                            <button id="webpush-allow" style="
                                flex: 1;
                                padding: 12px 20px;
                                border: none;
                                border-radius: 8px;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                font-size: 14px;
                                font-weight: 500;
                                cursor: pointer;
                                transition: all 0.2s;
                            ">${settings.allowText}</button>
                        </div>
                    </div>
                `;

                overlay.appendChild(promptBox);
                document.body.appendChild(overlay);

                // Add hover effects
                const denyBtn = document.getElementById('webpush-deny');
                const allowBtn = document.getElementById('webpush-allow');

                denyBtn.onmouseover = () => denyBtn.style.background = '#f5f5f5';
                denyBtn.onmouseout = () => denyBtn.style.background = 'white';
                allowBtn.onmouseover = () => allowBtn.style.transform = 'scale(1.05)';
                allowBtn.onmouseout = () => allowBtn.style.transform = 'scale(1)';

                // Handle button clicks
                denyBtn.onclick = () => {
                    overlay.remove();
                    localStorage.setItem('webpush-prompt-dismissed', 'true');
                    resolve(false);
                };

                allowBtn.onclick = () => {
                    overlay.remove();
                    resolve(true);
                };

                // Close on overlay click (optional)
                overlay.onclick = (e) => {
                    if (e.target === overlay) {
                        overlay.remove();
                        localStorage.setItem('webpush-prompt-dismissed', 'true');
                        resolve(false);
                    }
                };

            } catch (error) {
                console.error('[WebPush] Error showing custom prompt:', error);
                // On error, proceed with default behavior
                resolve(true);
            }
        });
    }

    // Add subscriber to a segment
    async function addToSegment(segmentId) {
        console.log('[WebPush] addToSegment called with ID:', segmentId);
        try {
            const isSub = await isSubscribed();
            console.log('[WebPush] isSubscribed:', isSub);

            if (!isSub) {
                console.log('[WebPush] Not subscribed, attempting to subscribe...');
                const subscribed = await subscribe();
                console.log('[WebPush] Subscribe result:', subscribed);
                if (!subscribed) {
                    console.error('[WebPush] Must be subscribed to join a segment');
                    return false;
                }
            }

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            console.log('[WebPush] Got subscription endpoint:', subscription ? subscription.endpoint : 'null');

            if (!subscription) {
                console.error('[WebPush] No active subscription found');
                return false;
            }

            console.log('[WebPush] Sending request to:', `${apiUrl}/api/subscribers/segment`);
            const response = await fetch(`${apiUrl}/api/subscribers/segment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    segmentId,
                    endpoint: subscription.endpoint,
                }),
            });

            console.log('[WebPush] Response status:', response.status);
            const data = await response.json();
            console.log('[WebPush] Response data:', data);

            if (response.ok) {
                console.log('[WebPush] Successfully added to segment');
                return true;
            } else {
                console.error('[WebPush] Failed to add to segment:', data.error);
                return false;
            }
        } catch (error) {
            console.error('[WebPush] Error adding to segment:', error);
            return false;
        }
    }

    // Initialize
    async function init() {
        console.log('[WebPush] Initializing...');

        // Register SW ONCE (this is the only place it should be registered)
        if ('serviceWorker' in navigator) {
            try {
                console.log('[WebPush] Registering Service Worker...');
                const registration = await navigator.serviceWorker.register(`${apiUrl}/sw.js`);
                console.log('[WebPush] Service Worker registered:', registration.scope);
            } catch (error) {
                console.error('[WebPush] Service Worker registration failed:', error);
                return;
            }
        }

        const alreadySubscribed = await isSubscribed();

        if (alreadySubscribed) {
            console.log('[WebPush] Already subscribed to push notifications');
            return;
        }

        // Check if user already dismissed the prompt
        if (localStorage.getItem('webpush-prompt-dismissed') === 'true') {
            console.log('[WebPush] User previously dismissed prompt');
            return;
        }

        // Wait a bit before showing the prompt (better UX)
        setTimeout(async () => {
            console.log('[WebPush] Showing custom permission prompt...');
            const userAllowed = await showCustomPrompt();

            if (userAllowed) {
                console.log('[WebPush] User allowed, requesting browser permission...');
                await subscribe();
            } else {
                console.log('[WebPush] User denied custom prompt');
            }
        }, 2000);
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose functions globally
    window.webPushSubscribe = subscribe;
    window.webPushAddToSegment = addToSegment;
})();
