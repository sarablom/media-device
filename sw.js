self.addEventListener('install', function(event) {
    console.log('Service worker: install');
    // Attempt to load cached files
});

self.addEventListener('fetch', function(event) {
    console.log('Service worker: fetch');
	// Look for cached files and handle AJAX failures due to being offline
});