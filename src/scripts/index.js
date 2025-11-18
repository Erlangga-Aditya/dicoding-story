// file: src/scripts/index.js
import 'regenerator-runtime'; /* untuk async/await */
import '../styles/styles.css';
import '../styles/forms.css'; 
import '../styles/map.css';    
import App from './app.js';
import { VAPID_PUBLIC_KEY } from './config/push-config.js';
import API_CONFIG from './config/api-config.js';
import AuthHelper from './utils/auth-helper.js';
import { IdbHelper } from './utils/idb-helper.js';

const mainContent = document.getElementById('main-content');
const loadingOverlay = document.getElementById('loading-overlay');
const navigationContainer = document.getElementById('navigation-container'); // ⭐ BARU
const installBtn = document.getElementById('install-app-btn');
const pushToggleBtn = document.getElementById('push-toggle-btn');
const syncNowBtn = document.getElementById('sync-now-btn');
const outboxCountEl = document.getElementById('outbox-count');

if (!mainContent || !loadingOverlay || !navigationContainer) {
  console.error('Missing required elements (main-content, loading-overlay, or navigation-container) in index.html');
} else {
  // Buat instance App
  const app = new App({
    content: mainContent,
    loadingOverlay: loadingOverlay,
    navContainer: navigationContainer, // ⭐ BERIKAN ELEMENT INI
  });
}

// ---- PWA Install Prompt ----
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) {
    installBtn.hidden = false;
  }
});

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
  });
}

// ---- Service Worker Registration & Push ----
async function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register('service-worker.js');
    return registration;
  } catch (err) {
    console.error('SW registration failed', err);
    return null;
  }
}

async function subscribePush(registration) {
  if (!registration) return null;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }
  const subscribeOptions = {
    userVisibleOnly: true,
    applicationServerKey: await urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
  const subscription = await registration.pushManager.subscribe(subscribeOptions);

  // Send subscription to API
  const token = AuthHelper.getAuthToken();
  if (!token) {
    console.warn('User not logged in; skip sending subscription to server');
    return subscription;
  }
  await fetch(`${API_CONFIG.BASE_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
        auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
      },
    }),
  }).catch((e) => console.error('Failed to send subscription', e));

  return subscription;
}

async function unsubscribePush(registration) {
  if (!registration) return;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  // Notify server to remove subscription
  const token = AuthHelper.getAuthToken();
  try {
    if (token) {
      await fetch(`${API_CONFIG.BASE_URL}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
    }
  } catch (e) {
    console.error('Failed to unsubscribe on server', e);
  }

  await subscription.unsubscribe();
}

(async () => {
  const registration = await registerServiceWorker();

  // Setup toggle button visibility
  if (pushToggleBtn && registration) {
    pushToggleBtn.hidden = false;
    const pushLabel = pushToggleBtn.querySelector('.label');
    const updatePushLabel = (isEnabled) => {
      if (pushLabel) {
        pushLabel.textContent = isEnabled ? 'Disable Push' : 'Enable Push';
      } else {
        pushToggleBtn.textContent = isEnabled ? 'Disable Push' : 'Enable Push';
      }
    };
    const current = await registration.pushManager.getSubscription();
    updatePushLabel(!!current);

    pushToggleBtn.addEventListener('click', async () => {
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await unsubscribePush(registration);
      } else {
        try {
          await subscribePush(registration);
        } catch (e) {
          console.error(e);
          alert('Gagal mengaktifkan Push Notification. Pastikan izin notifikasi diizinkan.');
        }
      }
      const after = await registration.pushManager.getSubscription();
      updatePushLabel(!!after);
    });
  }
})();

// ---- Online sync for outbox ----
async function blobFromBase64(base64) {
  const res = await fetch(base64);
  return await res.blob();
}

async function syncOutboxWhenOnline() {
  if (!navigator.onLine) return;
  const items = await IdbHelper.getOutboxAll();
  if (!items || !items.length) return;
  for (const item of items) {
    if (item.type === 'add-story') {
      try {
        const formData = new FormData();
        formData.append('description', item.payload.description);
        if (item.payload.photoBase64) {
          const blob = await blobFromBase64(item.payload.photoBase64);
          formData.append('photo', blob, item.payload.photoFileName || 'story-photo.jpeg');
        }
        if (item.payload.location) {
          formData.append('lat', item.payload.location.lat);
          formData.append('lon', item.payload.location.lon);
        }
        await fetch(`${API_CONFIG.BASE_URL}/stories`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AuthHelper.getAuthToken()}`,
          },
          body: formData,
        });
        await IdbHelper.removeFromOutbox(item.localId);
      } catch (_) {
        // stop on first failure to retry later
        return;
      }
    }
  }
}

window.addEventListener('online', () => {
  syncOutboxWhenOnline();
});
// Try once at startup
syncOutboxWhenOnline();

// Manual sync + indicator
async function refreshOutboxCount() {
  try {
    const items = await IdbHelper.getOutboxAll();
    if (outboxCountEl) outboxCountEl.textContent = items?.length || 0;
  } catch {
    if (outboxCountEl) outboxCountEl.textContent = '0';
  }
}
refreshOutboxCount();
setInterval(refreshOutboxCount, 4000);

if (syncNowBtn) {
  syncNowBtn.addEventListener('click', async () => {
    await syncOutboxWhenOnline();
    await refreshOutboxCount();
    alert('Sinkronisasi selesai (jika ada item).');
  });
}
