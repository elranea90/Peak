# NOTIFICACIONES PUSH - INSTRUCCIONES DE IMPLEMENTACIÓN

## 📋 Archivos incluidos

1. **index.html** - HTML actualizado con integración de notificaciones push
2. **push-notifications.js** - Script principal para manejar las notificaciones
3. **firebase-messaging-sw.js** - Service Worker para Firebase Cloud Messaging
4. **README.md** - Este archivo con instrucciones

---

## 🚀 PASOS PARA IMPLEMENTAR

### 1. Subir archivos a tu servidor

Sube los siguientes archivos a la raíz de tu proyecto web:

- `index.html` (reemplaza el existente)
- `push-notifications.js` (nuevo)
- `firebase-messaging-sw.js` (nuevo, **DEBE estar en la raíz**)

⚠️ **IMPORTANTE**: El archivo `firebase-messaging-sw.js` DEBE estar en la raíz del dominio (ejemplo: `https://tudominio.com/firebase-messaging-sw.js`) para que funcione correctamente.

---

### 2. Verificar configuración de Firebase

El archivo `push-notifications.js` ya está configurado con tu proyecto Firebase:
- Project ID: `salon1-e0e58`
- Database URL: `https://salon1-e0e58-default-rtdb.europe-west1.firebasedatabase.app`

**Si tu proyecto es diferente**, actualiza las líneas 7-15 en `push-notifications.js` con tu configuración.

La URL de la Cloud Function ya está configurada para:
```
https://europe-west1-salon1-e0e58.cloudfunctions.net/subscribeCliente
```

**Si tu Cloud Function está en otra región o proyecto**, actualiza la línea 108 en `push-notifications.js`.

---

### 3. Verificar configuración de Firebase

Asegúrate de que en tu proyecto Firebase tienes:

✅ Firebase Cloud Messaging habilitado
✅ Las Cloud Functions desplegadas (pushPedidoListo y subscribeCliente)
✅ Las reglas de Realtime Database permiten escribir en `/pedidos/{pedidoId}/fcmToken`

---

### 4. Reglas de Firebase Realtime Database

Agrega esta regla para permitir que los clientes guarden su token FCM:

```json
{
  "rules": {
    "pedidos": {
      "$pedidoId": {
        "fcmToken": {
          ".write": "true",
          ".read": "true"
        }
      }
    }
  }
}
```

---

## 🔔 CÓMO FUNCIONA

### Flujo de notificaciones:

1. **Usuario entra a la app** → Ve el formulario de nombre
2. **Usuario introduce su nombre y hace clic en "Continuar"** → Inmediatamente aparece el popup del navegador pidiendo permiso para notificaciones
3. **Si acepta el permiso** → Se obtiene el token FCM automáticamente
4. **Usuario hace un pedido** → El token FCM se guarda automáticamente en el pedido
5. **Pedido cambia a estado "listo"** → Cloud Function detecta el cambio
6. **Cloud Function envía notificación** → Usando el token guardado
7. **Usuario recibe la notificación** → "🍔 Pedido listo - Tu pedido ya está listo. Pásate por barra."

### ⚠️ IMPORTANTE - Flujo del permiso:
- El permiso se solicita **JUSTO DESPUÉS** de introducir el nombre
- La secuencia es: Introduce nombre → Click "Continuar" → Popup de permiso de notificaciones
- Si el usuario rechaza el permiso, la app sigue funcionando normalmente pero sin notificaciones push
- El permiso solo se pide una vez; si el usuario lo rechaza, tendrá que habilitarlo manualmente en la configuración del navegador

---

## 🎯 CARACTERÍSTICAS IMPLEMENTADAS

✅ Solicitud de permiso justo después de pedir el nombre
✅ Notificación push cuando el pedido está listo
✅ Banner in-app para mostrar notificaciones cuando la app está abierta
✅ Sonido y vibración al recibir notificación
✅ Suscripción automática al topic "clientes"
✅ Token FCM guardado en cada pedido
✅ Service Worker para notificaciones en segundo plano
✅ Manejo de notificaciones cuando la app está cerrada

---

## 🧪 TESTING

### Para probar las notificaciones:

1. Abre la app en un dispositivo móvil o navegador compatible
2. Introduce tu nombre → Acepta el permiso de notificaciones
3. Haz un pedido
4. En Firebase Console, ve a Realtime Database
5. Localiza tu pedido en `/pedidos/{pedidoId}`
6. Cambia manualmente el campo `estado` a `"listo"`
7. Deberías recibir la notificación push inmediatamente

### Verificar que funciona:

- En Chrome DevTools → Application → Service Workers (debe aparecer registrado)
- Console del navegador → Buscar "Token FCM obtenido"
- Firebase Console → Realtime Database → Verificar que el token está guardado en el pedido

---

## 📱 COMPATIBILIDAD

- ✅ Chrome/Edge (escritorio y móvil)
- ✅ Firefox (escritorio y móvil)
- ✅ Safari (escritorio - desde macOS 13+)
- ⚠️ Safari iOS - Requiere agregar a pantalla de inicio (PWA)
- ❌ Modo incógnito/privado (limitado)

---

## 🐛 TROUBLESHOOTING

### "No se muestra la notificación"
- Verifica que el permiso esté concedido en la configuración del navegador
- Revisa la consola del navegador para errores
- Verifica que el service worker esté registrado

### "Token FCM no se obtiene"
- Verifica que la clave VAPID sea correcta
- Asegúrate de que el service worker esté en la raíz
- Revisa que Firebase esté correctamente configurado

### "Cloud Function no envía notificación"
- Verifica que la función esté desplegada en europe-west1
- Revisa los logs de Cloud Functions en Firebase Console
- Asegúrate de que el token FCM esté guardado en el pedido

---

## 🔐 SEGURIDAD

La clave VAPID pública incluida en el código es segura para compartir públicamente. Es necesaria para que los navegadores validen las notificaciones push de tu servidor Firebase.

---

## 📞 SOPORTE

Si tienes problemas con la implementación:

1. Revisa la consola del navegador en busca de errores
2. Verifica los logs de Cloud Functions
3. Asegúrate de que todos los archivos estén en las ubicaciones correctas
4. Confirma que Firebase Cloud Messaging esté habilitado en tu proyecto

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Archivos subidos al servidor
- [ ] firebase-messaging-sw.js en la raíz del dominio
- [ ] URL de Cloud Function actualizada en push-notifications.js
- [ ] Reglas de Firebase configuradas
- [ ] Cloud Functions desplegadas
- [ ] Probado en dispositivo real
- [ ] Notificaciones funcionando correctamente

---

**¡Listo! 🎉** Tus usuarios ahora recibirán notificaciones push cuando su pedido esté listo.
