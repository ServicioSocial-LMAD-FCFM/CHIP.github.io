'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "f355fbf634dc1e79828a2ec3eb046665",
"assets/assets/loadingGif/LoadingGif.gif": "6996ea5f10d024f7b94b30ed3afe6a54",
"assets/FontManifest.json": "4df4a2fc68ae6aeca986031b639d7b84",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/NOTICES": "ee0d913d89ee3d41398fd3a08c418ba2",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"assets/packages/open_iconic_flutter/assets/open-iconic.woff": "3cf97837524dd7445e9d1462e3c4afe2",
"assets/resources/fonts/Mosk%2520Extra-Light%2520200.ttf": "402508a703f8405f7e11e870545ef6f0",
"assets/resources/img/avatars/avatar1.png": "df47f58856e3463a238d3d616a08f554",
"assets/resources/img/avatars/avatar2.png": "aebc5a3182cdf6eeb2af688da07ef02e",
"assets/resources/img/avatars/avatar3.png": "05a7bf1a3388fc5cd2419eeec0a18ca9",
"assets/resources/img/avatars/avatar4.png": "80e9b2b632c5da89e23f08d9e0e0b106",
"assets/resources/img/avatars/avatar5.png": "51ec4f9a2b05768991d9d044fc67d891",
"assets/resources/img/avatars/avatar6.png": "0f0e2a164608fe71bd087ac5711ad26b",
"assets/resources/img/herramientas/diagramas.png": "db52c58e9d54ceec4d9150a97425cbc9",
"assets/resources/img/herramientas/ensayo.png": "8a19defbde79af7314c66fe5bf19f278",
"assets/resources/img/herramientas/informe.png": "a1ef25533a9ba6408b759e6fbefca48f",
"assets/resources/img/herramientas/lenguaje.png": "cc3194e022a7131a200872c515b4345b",
"assets/resources/img/herramientas/mapaconceptual.png": "4b43834eee9f8ef0cf07af2b2baf49ab",
"assets/resources/img/herramientas/mapamental.png": "40ba20d73e5a1413ca8c8f7d8184a377",
"assets/resources/img/herramientas/parafrasis.png": "8af5e360c226ba9f2b1ea0f43dd98910",
"assets/resources/img/herramientas/resena.png": "d8e8ef702abfecff1309b2b9501de756",
"assets/resources/img/herramientas/tabla.png": "bbf611ab14924a02587eeb857752b262",
"assets/resources/img/herramientas/triptico.png": "1a49d872d8ae4b7d2d4a782fe7967aea",
"assets/resources/svg/herramientas/Diagramas.svg": "53a8b16becc4a19c8e8d5880a2db163a",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "bfee9b97c4364a94933bdbc533f7feb3",
"/": "bfee9b97c4364a94933bdbc533f7feb3",
"main.dart.js": "9f20d70767d2b38dd7d964df9cd66c44",
"manifest.json": "05043fdef4358d7aa3d86253c006181d",
"version.json": "705d7ca428b5c3e497cade91294706e5"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
