importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');

// workbox.precaching.precacheAndRoute([
//     { url: '/index.html', revision: '1' },
//     { url: '/nav.html', revision: '1' },
// 		{ url: '/manifest.json', revision: '1' },
// 		{ url: '/favicon.png', revision: '1' },
//     { url: '/css/materialize.min.css', revision: '1' },
// 		{ url: '/css/style.css', revision: '1' },
//     { url: '/js/materialize.min.js', revision: '1' },
// 		{ url: '/js/idb.js', revision: '1' },
// 		{ url: '/js/db.js', revision: '1' },
//     { url: '/js/script.js', revision: '1' },
// 		{ url: '/js/api.js', revision: '1' }
// ]);


workbox.routing.registerRoute(
  new RegExp('/pages/'),
    workbox.strategies.staleWhileRevalidate({
        cacheName: 'pages'
    })
);

workbox.routing.registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg)$/,
  workbox.strategies.cacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
);

workbox.routing.registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'google-fonts',
  })
);


workbox.routing.registerRoute(
  /^https:\/\/api\.football-data\.org/,
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'football-data-',
  })
);



self.addEventListener('push', function(event) {
  var body;
  if (event.data) {
    body = event.data.text();
  } else {
    body = 'no payload';
  }
  var options = {
    title: "spurs.info",
    body: "hello world",
    icon: 'spurs_icon_192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  event.waitUntil(
    self.registration.showNotification('Push Notification', options)
  );
});
