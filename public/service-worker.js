
importScripts('data-server.js');
importScripts('efs.js');

/*** STORAGE, VARIABLES and CACHING ***/
console.log("Service worker: Starting...NOW");
// temp storage object for the service worker
const storageSW = {
    data: {},
    needsSync: false,
}

let port;

const addResoucesToCache = async (resources) => {
    const cache = await caches.open("v1");
    await cache.addAll(resources);
};



// this is only a placeholder for now
const showNotification = (data) => {
    self.registration.showNotification("Data Updated!", {
        body: data.message || "New data available.",
        icon: "/images/notification-icon.png"
    });
}

const serveNotification = (data) => {
        showNotification(data);
}

/*** SERVICE WORKER EVENTS/API ***/


// used to check if the app can receive messages
const isViewActive = () => {
    if (port) {
        console.log("Service worker: Checking app view!");
        port.postMessage({type: 'is view active', payload: null});
        setTimeout(() => {
            if (!storageSW.needsSync) {
                serveNotification(storageSW.data);
            }
        }, 100);
    }
    
}


// listen for incoming messages from the client app
self.addEventListener('message', (event) => {

    // if a message is received from the client app that the app is open
    // then set the appActive flag to true
    if (event.data.type === 'view is active') {
        console.log("Service worker: Confirmed view is active");
        port = event.ports[0];
        const result = updatePlantState(storageSW.data);
        if (result) {
            console.log('Plant data updated in EFS from SW');
        }
        else {
            console.log('Plant data not updated to EFS from SW');
        }
    }

    if (event.data.type === "connect") {
        console.log("Service worker: Port connected");
        port = event.ports[0];    
    }
        
});


// Listen for sync events
self.addEventListener("sync", (event) => {
    if (event.tag === "syncNotifications") {
        storageSW.needsSync = true;
        event.waitUntil(() => {
            if (storageSW.needsSync) {
                showNotification(storageSW.data);
                storageSW.needsSync = false;
            }
        });
    }
});


self.addEventListener("install", (event) => {
    // dont install until all resources are cached
   // event.waitUntil(/*addResoucesToCache(["/", "/index.html", "/main.js", "/style.css"])*/);

    console.log("Service worker: Checking for data update...");
    setInterval(() => {
    
        queryPlantDataServer(storageSW, isViewActive)
    }
    , 9000); // 2 minutes
});

self.addEventListener("activate", (event) => {
    setInterval(() => {
        queryPlantDataServer(storageSW, isViewActive)
    }, 9000);

});

const cacheFirst = async (request) => {
    const cached = await caches.match(request);
    // fetch function carries out a request4
    return cached ?? fetch(request);
}

// highjack fetch requests from client to server
self.addEventListener("fetch", (event) => {
    
  
    console.log("fetch intercepted: ", event.request.url);
    event.respondWith(cacheFirst(event.request));
});

