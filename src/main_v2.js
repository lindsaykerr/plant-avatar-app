import paaclogo from '/paac.svg';
import './style.css';


const capableOf = {
    bg_syncing: "SyncManager" in window,
    notifications: "Notification" in window,
};

// see if a cache exists, if not, create one




async function getCacheStorage() {
    const cacheVersion = 'v1';
    const cacheName = `paac-cache-${cacheVersion}`;
    const cache = await caches.open(cacheName);
    return cache;
}

// create persistent data storage Inod





if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
}

// Check if the browser supports notifications, if so, add a button to enable them
if (capableOf.notifications && capableOf.bg_syncing) {
    const notificationButton = document.createElement('button');
    notificationButton.textContent = 'Enable Notifications';
    notificationButton.id = 'notificationButton';
    notificationButton.className = 'button';
    notificationButton.addEventListener('click', setupNotifications);
    const app = document.querySelector('#app');
    app.appendChild(notificationButton);
 

}
else {
    /* basic functionality, app only works when it is viewed */
}

// if notifications are supported, run a background sync to check for data updates
function setupNotifications() { 
    Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
            run_bg_sync();


            console.log('Notification permission granted.');
        } else {
            console.log('Notification permission denied.');
        }
    });
}

function run_bg_sync() {



    navigator.serviceWorker.ready.then(function(registration) {
        
        registration.sync.register('check-data-update').then(() => {
            console.log('Background sync registered');
        }).catch((error) => {
            console.error('Background sync registration failed:', error);
        });
    });
}


const app_div = document.createElement('div');
app_div.innerHTML = `<div>
<a href="https://vite.dev" target="_blank">
  <img src="${paaclogo}" class="logo" alt="Paac logo" />
</a>

<h1>Hello PAAC</h1>

</div>`;



document.querySelector('#app').appendChild = app_div;
/*
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
    }).catch(function(error) {
        console.error('Service Worker registration failed:', error);
    });
}







if ('serviceWorker' in navigator && 'SyncManager' in window && 'Notification' in window) {
    console.log('Service Worker and SyncManager and are supported');
    navigator.serviceWorker.ready.then(function(registration) {



  
        // Request permissions for notifications
        Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
            console.log('Notification permission granted.');
        } else {
            console.log('Notification permission denied.');
        }
        });

        // Register a periodic sync event
        function registerSync() {
        registration.sync.register('check-data-update').then(() => {
            console.log('Background sync registered');
        }).catch((error) => {
            console.error('Background sync registration failed:', error);
        });
        }

        // Register sync immediately, and then every few minutes.
        registerSync();
        setInterval(registerSync, 180000); // 3 minutes = 180000 milliseconds
    });
  }

  document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${paaclogo}" class="logo" alt="Paac logo" />
    </a>

    <h1>Hello PAAC</h1>

  </div>`;

  */