// Helper for browser push notifications (Notifications API)
// Works when the PWA tab is open/in background. True push (closed app) requires a push server.

let lastSeenCount = -1;

export async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        console.warn('Este navegador no soporta notificaciones.');
        return false;
    }
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

export function showNotification(title: string, body: string, icon = '/icons/icon-192.png') {
    if (Notification.permission !== 'granted') return;
    const notif = new Notification(title, {
        body,
        icon,
        badge: '/icons/icon-192.png',
        tag: 'missolucionesia-lead',
    });
    notif.onclick = () => {
        window.focus();
        notif.close();
    };
}

export function initLeadNotifications(
    currentCount: number,
    onNew?: (count: number) => void
) {
    if (lastSeenCount === -1) {
        // First load — calibrate without triggering
        lastSeenCount = currentCount;
        return;
    }
    if (currentCount > lastSeenCount) {
        const nuevos = currentCount - lastSeenCount;
        showNotification(
            `🆕 ${nuevos} nueva${nuevos > 1 ? 's' : ''} solicitud${nuevos > 1 ? 'es' : ''}`,
            'Hay nuevas solicitudes de cotización en el dashboard.'
        );
        if (onNew) onNew(nuevos);
        lastSeenCount = currentCount;
    }
}
