
export const sendNotification = (title: string, options?: NotificationOptions): void => {
    // Check if notifications are supported
    if (!('Notification' in window)) {
        console.warn("This browser does not support desktop notifications.");
        return;
    }

    // Check if permission is already granted
    if (Notification.permission === 'granted') {
        new Notification(title, { ...options, icon: '/vite.svg' });
    }
};

export const requestNotificationPermission = (): void => {
    if (!('Notification' in window)) {
        console.warn("This browser does not support desktop notifications.");
        return;
    }

    // Request permission if it's not denied or granted yet
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log("Notification permission granted.");
            }
        });
    }
};
