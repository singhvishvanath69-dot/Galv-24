// PSB Teacher PRO — Service Worker
// मकसद सिर्फ़ इतना: (1) Browser को यह App "Install" करने लायक (PWA) दिखे,
// (2) App Shell (teacher-app.html) एक बार खुलने के बाद अगली बार Offline/धीमे
// Internet में भी तुरंत खुल जाए। यह पूरी तरह Optional/Best-effort है — अगर
// Cache से कुछ न मिले, तो हमेशा असली Internet से ही Fetch होगा।
const CACHE_NAME = "psb-teacher-pro-v1";
const APP_SHELL = [
  "./teacher-app.html",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: पहले Internet से ताज़ा Data लाने की कोशिश (ताकि टीचर को हमेशा नया
// Version मिले), Internet न होने पर ही पुराना Cached Version दिखाएं।
self.addEventListener("fetch", (event) => {
  if(event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
