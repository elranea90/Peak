// ========================================
// PUSH NOTIFICATIONS - FCM
// ========================================

const VAPID_PUBLIC_KEY = "BP5asYEg0L_PMQWegCdOfkRRnpxp1Mlm5gaV85zytrcmLkVKXZhH2cSIapR1ZhpXfw2v_BbvERIYEtw-f53dEe8";

// Configuración de Firebase Messaging
const messagingConfig = {
  apiKey: "AIzaSyBZ9s0BWMJRlJKOw7v8KArQ0hB9XLpxDdY",
  authDomain: "salon1-e0e58.firebaseapp.com",
  databaseURL: "https://salon1-e0e58-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "salon1-e0e58",
  storageBucket: "salon1-e0e58.firebasestorage.app",
  messagingSenderId: "831451913848",
  appId: "1:831451913848:web:4cf086d55bcf89b1c4f3db"
};

let messaging = null;

// Inicializa Firebase Messaging
function initPushNotifications() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers no soportados');
    return;
  }

  if (!('PushManager' in window)) {
    console.warn('Push notifications no soportadas');
    return;
  }

  // Registrar el service worker
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(registration => {
      console.log('Service Worker registrado:', registration);
      
      // Inicializar Firebase app para messaging (separada de la principal)
      if (!firebase.apps.find(app => app.name === 'messaging-app')) {
        const messagingApp = firebase.initializeApp(messagingConfig, 'messaging-app');
        messaging = firebase.messaging(messagingApp);
      } else {
        const messagingApp = firebase.app('messaging-app');
        messaging = firebase.messaging(messagingApp);
      }
      
      console.log('Firebase Messaging inicializado');
      configurarManejadorMensajes();
    })
    .catch(err => {
      console.error('Error al registrar Service Worker:', err);
    });
}

// Solicitar permiso para notificaciones
async function solicitarPermisoNotificaciones() {
  try {
    console.log('Solicitando permiso de notificaciones...');
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Permiso de notificaciones concedido');
      await obtenerTokenFCM();
      return true;
    } else if (permission === 'denied') {
      console.warn('❌ Permiso de notificaciones denegado');
      return false;
    } else {
      console.warn('⚠️ Permiso de notificaciones no concedido');
      return false;
    }
  } catch (error) {
    console.error('Error al solicitar permiso:', error);
    return false;
  }
}

// Obtener token FCM
async function obtenerTokenFCM() {
  if (!messaging) {
    console.warn('Messaging no inicializado');
    return null;
  }

  try {
    const swRegistration = await navigator.serviceWorker.ready;
    
    // Obtener el token
    const token = await messaging.getToken({
      vapidKey: VAPID_PUBLIC_KEY,
      serviceWorkerRegistration: swRegistration
    });
    
    if (token) {
      console.log('✅ Token FCM obtenido:', token.substring(0, 20) + '...');
      window.fcmToken = token;
      
      // Suscribir al topic "clientes"
      await suscribirATopic(token);
      
      return token;
    } else {
      console.warn('No se pudo obtener el token FCM');
      return null;
    }
  } catch (error) {
    console.error('Error al obtener token FCM:', error);
    return null;
  }
}

// Suscribir al topic "clientes"
async function suscribirATopic(token) {
  try {
    // URL de tu Cloud Function - ACTUALIZA ESTO CON TU PROYECTO
    const functionUrl = 'https://europe-west1-salon1-e0e58.cloudfunctions.net/subscribeCliente';
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: token })
    });
    
    if (response.ok) {
      console.log('✅ Suscrito al topic "clientes"');
    } else {
      console.error('Error al suscribir al topic:', await response.text());
    }
  } catch (error) {
    console.error('Error en suscripción al topic:', error);
  }
}

// Manejar mensajes cuando la app está en primer plano
function configurarManejadorMensajes() {
  if (!messaging) {
    console.warn('Messaging no inicializado para configurar manejador');
    return;
  }

  try {
    messaging.onMessage((payload) => {
      console.log('📬 Mensaje recibido en primer plano:', payload);
      
      const notificationTitle = payload.notification?.title || '🍔 Notificación';
      const notificationBody = payload.notification?.body || 'Tienes una nueva notificación';
      
      // Mostrar notificación personalizada en la UI
      mostrarNotificacionEnApp(notificationTitle, notificationBody);
      
      // Reproducir sonido y vibrar
      try {
        const beepSound = new Audio("data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA=");
        beepSound.play().catch(() => {});
      } catch (e) {}
      
      try {
        navigator.vibrate?.([200, 100, 200, 100, 400]);
      } catch (e) {}
    });
    
    console.log('✅ Manejador de mensajes configurado');
  } catch (error) {
    console.error('Error al configurar manejador de mensajes:', error);
  }
}

// Mostrar notificación en la app
function mostrarNotificacionEnApp(titulo, mensaje) {
  const banner = document.getElementById('pushNotifBanner');
  const tituloEl = document.getElementById('pushNotifTitle');
  const mensajeEl = document.getElementById('pushNotifMessage');
  
  if (banner && tituloEl && mensajeEl) {
    tituloEl.textContent = titulo;
    mensajeEl.textContent = mensaje;
    banner.style.display = 'block';
    
    // Auto-ocultar después de 10 segundos
    setTimeout(() => {
      banner.style.display = 'none';
    }, 10000);
  }
}

// Función para cerrar el banner de notificación
window.cerrarPushNotif = function() {
  const banner = document.getElementById('pushNotifBanner');
  if (banner) {
    banner.style.display = 'none';
  }
};

// Exportar funciones para uso global
window.pushNotifications = {
  init: initPushNotifications,
  solicitarPermiso: solicitarPermisoNotificaciones,
  obtenerToken: obtenerTokenFCM,
  configurarManejadorMensajes: configurarManejadorMensajes
};

// Auto-inicializar cuando se cargue el script
console.log('🚀 Inicializando sistema de notificaciones push...');
initPushNotifications();
