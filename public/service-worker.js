
importScripts('service-worker/data-server.js');
importScripts('service-worker/efs.js');


// flag to show notifications
let showNotifications = false;


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
    if (!showNotifications) {
        return;
    }
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
        showNotifications = false;
        
        /*
        const result = updatePlantState(storageSW.data);
        if (result) {
            console.log('Plant data updated in EFS from SW');
        }
        else {
            console.log('Plant data not updated to EFS from SW');
        }
        */
    }

    if (event.data.type === "connect") {
        console.log("Service worker: Port connected");
        port = event.ports[0];    

        console.log("Port: ", port);
        isViewActive();
    }

    if (event.data.type === "allow-notifications") {
        console.log("Service worker will: Allow notifications");
        if (event.data.payload) {
            showNotifications = true;
        }
    }

    if (event.data.type === "get-data-update") {
        
        console.log("Service worker: Getting Data from client");
        if (Object.keys(storageSW.data).length === 0) {
            queryPlantDataServer(storageSW).then((data) =>{
                console.log("Payload Data after request:", storageSW.data)
                port.postMessage({type: "get-data-update", payload: storageSW.data});
            });
        }
        else {
            console.log("Payload data without request:", storageSW.data)
            port.postMessage({type: "get-data-update", payload: storageSW.data});
        }
    }

    if (event.data.type === "request-stored-data") {
        console.log("Service worker: Storing data from client");
        storageSW.data = event.data.payload;
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
    if (port) {
        console.log("Service worker: Requesting stored data, if any, on the client");
        port.postMessage({type: 'request-stored-data', payload: null});
    }
    
    console.log("Service worker: Checking for data update...");
    setInterval(() => {
    
        queryPlantDataServer(storageSW)
    }
    , 9000); // 2 minutes
});

self.addEventListener("activate", (event) => {
    
    setInterval(() => {
        queryPlantDataServer(storageSW)
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

