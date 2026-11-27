// App instalable: siempre se pide la versión nueva a internet.
// Solo si no hay conexión se muestra la última copia guardada de la página.
const CACHE = 'clubsp-v3';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || r.mode !== 'navigate') return;
  e.respondWith(fetch(r).then(resp => {
    const copia = resp.clone(); caches.open(CACHE).then(c => c.put('./', copia)); return resp;
  }).catch(() => caches.match('./')));
});

// Avisos al móvil: comunicados de la junta y pagos recibidos: notificación y número en el icono de la app.
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) {}
  const tareas = [self.registration.showNotification(d.titulo || 'Windsurf Club SP', {
    body: d.cuerpo || 'Tienes un comunicado nuevo de la junta', icon: 'iconos/icono-192.png', badge: 'iconos/icono-192.png',
    tag: d.tag || 'comunicado', renotify: true, data: { url: d.url || './?ir=comunicados', ir: d.ir || 'comunicados' } })];
  if (self.navigator && self.navigator.setAppBadge) tareas.push(self.navigator.setAppBadge(d.n || 1).catch(() => {}));
  e.waitUntil(Promise.all(tareas));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './?ir=comunicados', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => {
    for (const c of l) if ('focus' in c) { c.postMessage({ ir: (e.notification.data && e.notification.data.ir) || 'comunicados' }); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
