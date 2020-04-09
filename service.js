self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return RefreshCache();
    })
  );
});

self.addEventListener('activate', function () {
	clients.claim();
	CheckUpdate();
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
		fetch(event.request)
		// caches.match(event.request).then(function(response) {
		// 	return response || fetch(event.request);
		// })
	);
	
	if (!self.nextUpdateCheck || Date.now() > self) {
		CheckUpdate();
	}
});

async function CheckUpdate() {
	console.log('Check cache update');
	let currVer = await GetCacheVersion();
	if (!self.cacheVersion || cacheVersion < currVer) {
		await RefreshCache();
		self.cacheVersion = currVer;
		self.nextUpdateCheck = Date.now() + 24*60*60*1000; // next day
		console.log('Updated cache');
	}
}

async function GetCacheVersion() {
	let res = await fetch('/cache-version.dat');
	let data = await res.text();

	return data;
}

async function RefreshCache() {
	let res = await fetch('/cache.dat');
	let data = await res.text();
	let list = data.replace(/\r\n/g, '\n').split('\n');

	caches.delete('v1');
	
	let cache = await caches.open('v1');
	return cache.addAll(list);
}