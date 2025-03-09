(function(){
    // App startup

    // Set up the database
    const dbSettings = {
        name: 'appdb',
        version: 3,
    };
    let db = indexedDB.open(dbSettings.name, dbSettings.version);
    db.onsuccess = (event) => {
        console.log('Database opened successfully');
        
        const db2 = event.target.result;
        const transaction = db2.transaction('plant_data', 'readwrite');

        

        const objectStore = transaction.objectStore('plant_data');
        const request = objectStore.put({
            plant: 1,
            common_name: 'Chinese Money Plant',
            moisture_ideal: 6,
            moisture_max: 7,
            moisture_min: 4,
            name: 'Fred',
            reading: 3,
            recorded_at: 'Sun, 09 Mar 2025 14:47:48 GMT',
            species: 'Pilea peperomioides',
        });
        request.onsuccess = (event) => {
            console.log('Data added successfully');
        }
        request.onerror = (event) => {
            console.error('Error adding data: ', event.target.error);
        }
        

    };
    db.onerror = (event) => {
        console.error('Database error: ', event.target.error);
    };

 
    db.onupgradeneeded = (event) => {
        let database = event.target.result;
        const objectStore = database.createObjectStore('plant_data', { keyPath: 'plant' });
        /*
        objectStore.createIndex('plant_id', 'id', { unique: true });
        objectStore.createIndex('common_name', 'common_name', { unique: true });
        objectStore.createIndex('moisture_max', 'moisture_max', { unique: false });
        objectStore.createIndex('moisture_min', 'moisture_min', { unique: false });
        objectStore.createIndex('moisture_ideal', 'moisture_ideal', { unique: false });
        objectStore.createIndex('name', 'name', { unique: true });
        objectStore.createIndex('reading', 'reading', { unique: false });
        objectStore.createIndex('recorded_at', 'recorded_at', { unique: false });
        objectStore.createIndex('species', 'species', { unique: false });
        */
        
 
    };
  
})();


function deleteDatabase() {
    const dbSettings = {
        name: 'appdb',
        version: 2,
    };
    let db = indexedDB.deleteDatabase(dbSettings.name);
    db.onsuccess = (event) => {
        console.log('Database deleted successfully');
    };
    db.onerror = (event) => {
        console.error('Database error: ', event.target.error);
    };
}

//deleteDatabase();

const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        return;
    }
    try {
        
        const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });

        if (registration.installing) {
            console.log('Service worker installing');
        }
        else if (registration.waiting) {
            console.log('Service worker installed');
        }
        else if (registration.active) {
            console.log('Service worker active');
        }
    }
    catch (error) {
        console.error('Service Worker registration failed:', error);
    }
} 

registerServiceWorker();

const showCachedData = async () => {
    const cache = await caches.open('v1');
    cache.keys().then((keys) => {
        keys.forEach(async (key) => {
            const response = await cache.match(key);;
            console.log(response);
        });
    });
}

showCachedData();

// app settings 
const settings = {
    // 2 minutes 
    request_interval: 120000, 
};

const setAppSettings = async () => {
    const appcache = await caches.open('app_settings');
    const settingsResponse = new Response(JSON.stringify(settings));
    appcache.put(new Request('/settings'), settingsResponse);
}
const appcache = await caches.open('app_settings');