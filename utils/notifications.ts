export async function requestBrowserNotificationPermission() {
  if (import.meta.server || !('Notification' in globalThis)) {
    return 'unsupported'
  }

  return Notification.requestPermission()
}

export function canUseBrowserNotifications() {
  return import.meta.client && 'Notification' in globalThis
}

export function hasNotificationPermission() {
  return canUseBrowserNotifications() && Notification.permission === 'granted'
}

export function sendBrowserNotification(title: string, body: string) {
  if (!hasNotificationPermission()) {
    return null
  }

  return new Notification(title, { body })
}
