console.log('Service Worker Loaded...');

self.addEventListener('push', e => {
    const data = e.data.json();
    console.log('Push Received...');
    console.log(data);
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: 'https://gchan.com.br/sham.png?e93e9eaa0830ef43cfb378471a03c76b'
    });
});