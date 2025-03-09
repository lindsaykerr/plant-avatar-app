// service-worker.js

const cacheStorage = 

// Register background sync and notification if needed
self.addEventListener('install', (event) => {
    /*const cacheVersion = 'v1';
    const cacheName = `paac-cache-${cacheVersion}`;
    event.waitUntil(caches.open(cacheName).then());'));
    /*event.waitUntil(
      self.registration.showNotification('Service Worker Installed', {
        body: 'Ready to check for updates.',
      })
    );*/
    console.log('Service Worker Installed');
  });
  
  self.addEventListener('sync', (event) => {
    if (event.tag === 'check-data-update') {
      event.waitUntil(checkForDataUpdate(event));
    }
  });
  


  async function checkForDataUpdate(event) {
    // interval post message

    setInterval(() => {
        self.ServiceWorkerRegistration.;
    }

    event.source.postMessage('Checking for data update...');
  }

    /*
  async function checkForDataUpdate(event) {
    event.source.postMessage('Checking for data update...');
  
    try {
        if (!localStorage.getItem('fred')) {
            localStorage.setItem('fred', 0);
        }
      localStorage.getItem('fred') || 0;
      const response = await fetch('/api/v1/data/1/latest'); 
      const data = await response.json();

      if (plant['recorded_at'] !== data['recorded_at']) {
        localStorage.setItem('fred', data);
        await self.registration.showNotification('Data Updated!', {
          body: data.message || 'New data available.',
          icon: '/images/notification-icon.png', // Optional icon
        });
      }
      
        /*
        // Update the last checked timestamp
        localStorage.setItem('lastChecked', Date.now());
  
        // Optionally, fetch and cache the new data
        await fetch('/api/data'); // Replace with your data fetching endpoint.
        const cache = await caches.open('data-cache'); // Create a cache
        await cache.add('/api/data');

  
      else {
        console.log('No data update.');
        // Update the last checked timestamp anyway. This prevents excessive API calls if the data hasn't changed.
        //localStorage.setItem('lastChecked', Date.now());
      }
  
    } catch (error) {
      console.error('Error checking for data update:', error);
      // Handle error (e.g., retry, log)
    }
  }    

  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
  
    // Open the app when the notification is clicked
    event.waitUntil(clients.openWindow('/')); // or a specific page
  });
*/