// No-op service worker to prevent errors
self.addEventListener('fetch', (event) => {
  // Let the browser handle the request normally
  return;
});
