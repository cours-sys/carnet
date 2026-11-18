/* Carnet de révision : fonctionnement hors ligne (recommandation 13, 18 nov. 2026).
   La page (chiffrée) et les fichiers du site : réseau d'abord, copie gardée pour le hors-ligne.
   Les polices Google : copie gardée d'abord. Rien d'autre n'est intercepté (synchronisation Google Drive comprise). */
var V = "carnet-1";
var PAGE = new URL("./", self.registration.scope).href;
self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll([PAGE, "manifest.webmanifest", "icone-192.png"]); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
function garder(cle, rep) { if (rep && rep.ok) { var c = rep.clone(); caches.open(V).then(function (x) { x.put(cle, c); }); } return rep; }
self.addEventListener("fetch", function (e) {
  var r = e.request; if (r.method !== "GET") return;
  var u = new URL(r.url);
  if (u.origin === self.location.origin) {
    var cle = r.mode === "navigate" ? PAGE : r;
    e.respondWith(fetch(r).then(function (rep) { return garder(cle, rep); }).catch(function () {
      return caches.match(cle).then(function (x) { return x || caches.match(PAGE); });
    }));
  } else if (u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.match(r).then(function (x) { return x || fetch(r).then(function (rep) { return garder(r, rep); }); }));
  }
});
