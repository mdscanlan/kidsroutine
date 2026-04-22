const CACHE_NAME = 'daily-routine-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  self.clients.claim();
});

// Listen for messages from the main app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATIONS') {
    clearScheduled();
    scheduleNotifications();
  }
});

let morningTimer = null;
let eveningTimer = null;

function clearScheduled() {
  if (morningTimer) clearTimeout(morningTimer);
  if (eveningTimer) clearTimeout(eveningTimer);
}

function scheduleNotifications() {
  const now = new Date();

  // Next 1:00 AM
  const next1AM = new Date();
  next1AM.setHours(1, 0, 0, 0);
  if (next1AM <= now) next1AM.setDate(next1AM.getDate() + 1);

  // Next 1:00 PM
  const next1PM = new Date();
  next1PM.setHours(13, 0, 0, 0);
  if (next1PM <= now) next1PM.setDate(next1PM.getDate() + 1);

  const msUntil1AM = next1AM - now;
  const msUntil1PM = next1PM - now;

  morningTimer = setTimeout(() => {
    self.registration.showNotification("🌅 Morning Routine Time!", {
      body: "Rise and shine! Time to check off your morning tasks!",
      icon: "icon-192.png",
      badge: "icon-192.png",
      tag: "morning-routine",
      renotify: true,
      requireInteraction: true,
      actions: [{ action: 'open', title: 'Open Checklist' }]
    });
    // Reschedule for next day
    setTimeout(scheduleNotifications, 2000);
  }, msUntil1AM);

  eveningTimer = setTimeout(() => {
    self.registration.showNotification("🌙 Evening Prep Time!", {
      body: "Let's get ready for tomorrow! Time for your evening checklist!",
      icon: "icon-192.png",
      badge: "icon-192.png",
      tag: "evening-routine",
      renotify: true,
      requireInteraction: true,
      actions: [{ action: 'open', title: 'Open Checklist' }]
    });
  }, msUntil1PM);
}

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        self.clients.openWindow('/');
      }
    })
  );
});

// Start scheduling on activation
scheduleNotifications();
