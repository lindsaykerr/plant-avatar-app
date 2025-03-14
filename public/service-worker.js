
const addResoucesToCache = async (resources) => {
    const cache = await caches.open("v1");
    await cache.addAll(resources);
};

const showNotification = (data) => {
    self.registration.showNotification("Data Updated!", {
        body: data.message || "New data available.",
        icon: "/images/notification-icon.png"
    });
}

const SERVER_PATH = {
    LOCALTESTING : "http://localhost:7070/api/v1/data/1/latest",
    TESTING : "http://192.168.0.26:7070/api/v1/data/1/latest",
}; 

const myStorage = {
    data: {},
    needsSync: false,
}



async function  queryServer () {


    fetch(SERVER_PATH.LOCALTESTING)
    .then((response) => {
        if (!response.ok) {
            console.log("Response form server: ", response);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {


        if (myStorage.data["recorded_at"] !== data["recorded_at"]) {
           showNotification(data);

            myStorage.data = data;
        }
        
    })
    .catch((error) => {
        console.error("Error fetching data: ", error);
    });
}

let stored_data;

const getLastData = async () => {

    return localStorage.data;

    /*
    console.log("Service worker: Fetching last data...");
    const db = indexedDB.open("appdb", 3);
    db.onsuccess = (event) => {
        const database = event.target.result;
        const transaction = database.transaction("plant", "readonly");
        const store = transaction.objectStore("plant");
        const request = store.openCursor(null, "prev");

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                stored_data = cursor.value;
                cursor.continue();
            }
        }

        request.onerror = (event) => {
            console.error("Error fetching data: ", event.target.error);
        }
    }*/
}

const storeData = async (data) => {
    console.log("Service Worker: Storing data...");
    const db = indexedDB.open("appdb", 3);
    db.onsuccess = (event) => {
        console.log("something has changed")
        const database = event.target.result;
        const transaction = database.transaction("plant", "readwrite");
        const store = transaction.objectStore("plant");
        const request = store.put(data);

        request.onsuccess = (event) => {
            console.log("SW: Data added successfully: ", event.target.result);
        }

        request.onerror = (event) => {
            console.error("SW: Error adding data: ", event.target.error);
        }
    };

    db.onerror = (event) => {
        console.error("SW: Database error: ", event.target.error);
    };

    db.onupgradeneeded = (event) => {
        const database = event.target.result;
        const objectStore = database.createObjectStore("plant", { keyPath: "plant" });
    };
}

// Listen for sync events
self.addEventListener("sync", (event) => {
    if (event.tag === "syncNotifications") {
        myStorage.needsSync = true;
        event.waitUntil(() => {
            if (myStorage.needsSync) {
                showNotification(myStorage.data);
                myStorage.needsSync = false;
            }
        });
    }
});


self.addEventListener("install", (event) => {
    // dont install until all resources are cached
    event.waitUntil(addResoucesToCache(["/", "/index.html", "/main.js", "/style.css"]));
/*
    setInterval(() => {
        //self.registration.showNotification("Checking for data update...");
    }, 9000);
*/  console.log("Service worker: Checking for data update...");
    setInterval(() => {
    
        queryServer()
    }
    , 9000); // 2 minutes
});

self.addEventListener("activate", (event) => {
    setInterval(() => {
        queryServer()
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