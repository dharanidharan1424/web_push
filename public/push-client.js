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
            // Request permission
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                console.log('[WebPush] Notification permission denied');
                return false;
            }

            // Register service worker
            const registration = await navigator.serviceWorker.register(`${apiUrl}/sw.js`);
            await navigator.serviceWorker.ready;

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
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
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

        // Register SW if not already registered
        if ('serviceWorker' in navigator) {
            try {
                console.log('[WebPush] Registering Service Worker...');
                const registration = await navigator.serviceWorker.register(`${apiUrl}/sw.js`);
                console.log('[WebPush] Service Worker registered:', registration.scope);
            } catch (error) {
                console.error('[WebPush] Service Worker registration failed:', error);
            }
        }

        const alreadySubscribed = await isSubscribed();

        if (alreadySubscribed) {
            console.log('[WebPush] Already subscribed to push notifications');
            return;
        }

        // Wait a bit before showing the prompt (better UX)
        setTimeout(async () => {
            console.log('[WebPush] Auto-subscribing after delay...');
            await subscribe();
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
