// ========================================
// SERVICE WORKER para Firebase Cloud Messaging
// ========================================

// Importar Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuración de Firebase (debe coincidir con tu proyecto)
const firebaseConfig = {
  apiKey: "AIzaSyA4WVfgRW5oyZQLBFA0ZzbAwX9PF5dhJSU",
  authDomain: "peakturnos.firebaseapp.com",
  databaseURL: "https://peakturnos-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "peakturnos",
  storageBucket: "peakturnos.firebasestorage.app",
  messagingSenderId: "627022816978",
  appId: "1:627022816978:web:f0425ada8ed0958c6eaf0b"
};

// Inicializar Firebase en el service worker
firebase.initializeApp(firebaseConfig);

// Inicializar Messaging
const messaging = firebase.messaging();

// Manejar mensajes en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] Mensaje recibido en segundo plano:', payload);
  
  const notificationTitle = payload.notification?.title || '🍔 Pedido listo';
  const notificationOptions = {
    body: payload.notification?.body || 'Tu pedido ya está listo',
    icon: 'https://via.placeholder.com/192/ffc200/111?text=🍔',
    badge: 'https://via.placeholder.com/72/ffc200/111?text=!',
    vibrate: [200, 100, 200, 100, 400],
    tag: 'pedido-notification',
    requireInteraction: true,
    data: payload.data || {}
  };

  // Usar self.registration.showNotification en lugar de new Notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar click en la notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificación clickeada:', event);
  
  event.notification.close();
  
  // Abrir o enfocar la ventana de la aplicación
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Instalación del service worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  self.skipWaiting();
});

// Activación del service worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  event.waitUntil(clients.claim());
});

console.log('[Service Worker] Cargado correctamente');
