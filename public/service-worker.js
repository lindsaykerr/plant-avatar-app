
const addResoucesToCache = async (resources) => {
    const cache = await caches.open("v1");
    await cache.addAll(resources);
};


let stored_data;

const getLastData = async () => {
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
    }
}

const storeData = async (data) => {
    console.log("Service Worker: Storing data...");
    const db = indexedDB.open("appdb", 3);
    db.onsuccess = (event) => {
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





self.addEventListener("install", (event) => {
    // dont install until all resources are cached
    event.waitUntil(addResoucesToCache(["/", "/index.html", "/main.js", "/style.css"]));
/*
    setInterval(() => {
        //self.registration.showNotification("Checking for data update...");
    }, 9000);
*/
setInterval(() => {
    console.log("Service worker: Checking for data update...");
    fetch("http://192.168.0.26:7070/api/v1/data/1/latest")
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
        getLastData();
        if (stored_data["recorded_at"] !== data["recorded_at"]) {
            self.registration.showNotification("Data Updated!", {
                body: data.message || "New data available.",
                icon: "/images/notification-icon.png"
            });
        }
        storeData(data);
    })
    .catch((error) => {
        console.error("Error fetching data: ", error);
    });
}
, 9000); // 2 minutes
});

self.addEventListener("activate", (event) => {

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