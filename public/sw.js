// Service Worker for Push Notifications
self.addEventListener('install', (event) => {
    console.log('[SW] Service Worker installing');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Service Worker activating');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');

    if (!event.data) {
        console.log('[SW] Push event but no data');
        return;
    }

    let data;
    try {
        data = event.data.json();
    } catch (e) {
        console.error('[SW] Error parsing push data:', e);
        return;
    }

    const title = data.title || 'Notification';
    const options = {
        body: data.body || '',
        icon: data.icon || '/icon-192.png',
        badge: '/badge-72.png',
        data: {
            url: data.url || '/',
        },
        requireInteraction: false,
        tag: 'notification-' + Date.now(),
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked');

    event.notification.close();

    // Resolve URL – if it's relative, prepend the origin
    let urlToOpen = event.notification.data?.url || '/';
    if (urlToOpen.startsWith('/')) {
        urlToOpen = self.origin + urlToOpen;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Focus an existing client with the same URL
                for (const client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise open a new window/tab
                return clients.openWindow(urlToOpen);
            })
    );
});
