self.addEventListener('push', function(event) {
    const data = event.data.json();
    const title = data.title || 'New Notification';
    const body = data.body || 'You have a new message!';
    const icon = data.icon || '/vite.svg';

    event.waitUntil(
        self.registration.showNotification(title, {
            body: body,
            icon: icon,
            data: data, // Additional data for handling the notification click
        })
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    // Handle notification click (for example, open the app)
    event.waitUntil(
        clients.openWindow('/') // Redirect to the homepage or a specific URL
    );
});
