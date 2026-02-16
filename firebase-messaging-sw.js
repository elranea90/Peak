// ========================================
// SERVICE WORKER para Firebase Cloud Messaging
// ========================================

// Importar Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuración de Firebase (debe coincidir con tu proyecto)
const firebaseConfig = {
  apiKey: "AIzaSyBZ9s0BWMJRlJKOw7v8KArQ0hB9XLpxDdY",
  authDomain: "salon1-e0e58.firebaseapp.com",
  databaseURL: "https://salon1-e0e58-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "salon1-e0e58",
  storageBucket: "salon1-e0e58.firebasestorage.app",
  messagingSenderId: "831451913848",
  appId: "1:831451913848:web:4cf086d55bcf89b1c4f3db"
};

// Inicializar Firebase en el service worker
firebase.initializeApp(firebaseConfig);

// Inicializar Messaging
const messaging = firebase.messaging();

// Manejar mensajes en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('Mensaje recibido en segundo plano:', payload);
  
  const notificationTitle = payload.notification?.title || '🍔 Pedido listo';
  const notificationOptions = {
    body: payload.notification?.body || 'Tu pedido ya está listo',
    icon: '/icon-192.png', // Puedes personalizar este icono
    badge: '/badge-72.png', // Badge pequeño
    vibrate: [200, 100, 200, 100, 400],
    tag: 'pedido-notification',
    requireInteraction: true, // La notificación no se cierra automáticamente
    data: payload.data || {}
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar click en la notificación
self.addEventListener('notificationclick', (event) => {
  console.log('Notificación clickeada:', event);
  
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
  console.log('Service Worker instalado');
  self.skipWaiting();
});

// Activación del service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  event.waitUntil(clients.claim());
});
