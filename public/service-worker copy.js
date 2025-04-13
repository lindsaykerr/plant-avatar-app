/**
 * Author: Lindsay C Kerr
 */
importScripts('service-worker/data-server.js');
importScripts('service-worker/efs.js');




// flag to show notifications

let notificationPermission = false;
let showNotifications = false;


/*** STORAGE, VARIABLES and CACHING ***/
console.log("Service worker: Starting...NOW");
// temp storage object for the service worker

const notificationTypes = {

    overwatered: "overwatered",
    underwatered: "underwatered",
    beyond_acceptable: "beyond_acceptable",
    ideal: "ideal",
    watered: "watered",
    acceptable: "acceptable"
}

// emotive notification messages for types, from plants perspective
// each will have 3 varients based the valence of the message
// 0 - neutral, 1 - negative, 2 - positive
const notificationMessages = {
   
    'overwatered': ["😩 I have had enough water, thank you.", "Too much water", "I'm drowning! STOP watering me!"],
    'underwatered': [ "Can I have some water please?! 🥺", "I'm so thirsty!! 😩","Give me water💧 NOW!!!"],
    'beyond_acceptable': ["😵 I'm dying here!!!", "I this carries on, I might really just die.", "YOU ARE KILLING ME!!!"],
    'ideal': ["Thanks for looking after me. 🌱", "😁 Feeling good! ", "..."],
    'watered': ["Yay, water 😁", "I'm getting a drink 💧👌", "Its about time. 😏"],
    'acceptable': ["Doing well 😊", "😑 Things are okay...", "😅 I'm ALIVE... just."]
}
 

const storageSW = {
    data: {},
    notification: {
        next_notification: null,
        interval: 5000,
        interval_increment: 30000,
        max_attempts: 3,
        attempts: 0,
        type: ""
    },
    needsSync: false,
}
const isTempStorageEmpty = () => {
    return Object.keys(storageSW.data).length === 0;
};

let port;

const addResoucesToCache = async (resources) => {
    const cache = await caches.open("v1");
    await cache.addAll(resources);
};




// this is only a placeholder for now
const showNotification = (data) => {
    if (showNotifications) {

        self.registration.showNotification("Fred:", {
           
            body: `${data.message}`,
            icon: "/images/notification-icon.png"
        });
    }
    
}

const serveNotification = (data) => {
    console.log("Service worker: Serving notification");
    if (notificationPermission) {


        console.log("Service worker: Serving notification");
        showNotification(data);
    }
}

function isNotificationRequired(data) {
    let required = {
        type: notificationTypes.acceptable,
        message: notificationMessages.acceptable[0],
        needed: false,
    };

    // if the notification start date has not been set, then set it to now
    console.log("SW: Checking if notification is required");
    console.log("SW: Plant data: ", data);
    const plant_data = data;

    const reading = plant_data.reading;
    const min_moisture = plant_data.moisture_min;
    const max_moisture = plant_data.moisture_max;


    if (reading <= min_moisture || reading >= max_moisture) {
        if (reading <= min_moisture) {
            required.type = notificationTypes.underwatered;
        }
        else {
            required.type = notificationTypes.overwatered;
        }
        console.log("SW: 1 Notification will be required");
        required.needed = true;
    }
    else {
        required.needed = false;
        storageSW.notification.attempts = 0;
        storageSW.notification.next_notification = null;
        storageSW.notification.interval = 10000;
        storageSW.notification.type = "";
        console.log("SW: 2 Notification not required");
        return required;
    }

    if (storageSW.notification.next_notification == null) {
        storageSW.notification.next_notification = Date.now() + storageSW.notification.interval;
    }
    const startDate = storageSW.notification.next_notification;
    if (startDate > Date.now()) {
        console.log( Date.now() - startDate);
        console.log("SW: 3 Notification will be required");
        return required.needed = false;
    }
    else {
        const messageNumber = (storageSW.notification.attempts < 3) ? storageSW.notification.attempts : 2;
        console.log("Message number: ", messageNumber);
        console.log("Required type: ", required.type);
        required.message = notificationMessages[required.type][messageNumber];
        if (storageSW.notification.attempts <= storageSW.notification.max_attempts) {
            storageSW.notification.attempts++;
            storageSW.notification.interval += storageSW.notification.interval_increment;
        }
        else {
            // give up on notifications
            required.needed = false;
            return required;
        }
    }

    console.log("Storage SW:", storageSW);
    console.log("Required: ", required);

    console.log("SW: 4 Notification will be required");
    return required;
}

/*** SERVICE WORKER EVENTS/API ***/


// used to check if the app can receive messages
const isViewActive = () => {
    if (port) {
        console.log("Service worker: Checking app view!");
        port.postMessage({type: 'is view active', payload: null});
    }
    
}


// listen for incoming messages from the client app
self.addEventListener('message', (event) => {

    // if a message is received from the client app that the app is open
    // then set the appActive flag to true
    if (event.data.type === 'view is active') {
        // update port after inactivity
        console.log("Service worker: View is active", port);
        try {
            port.postMessage({type: "get-data-update", payload: storageSW.data });
        } catch (error) {
            console.error("Client port not available trying again");
            try {
                setTimeout(() => {
                    port.postMessage({type: "get-data-update", payload: storageSW.data });
                }
                , 50);
            }
            catch (error) {
                console.error("Client port def not available: ", error);
            }
        }  
    }
          
        
        /*
        const result = updatePlantState(storageSW.data);
        if (result) {
            console.log('Plant data updated in EFS from SW');
        }
        else {
            console.log('Plant data not updated to EFS from SW');
        }
        */
    

    if (event.data.type === "connect") {
        console.log("Service worker: Port connected");
        port = event.ports[0];    

        console.log("Port: ", port);
        isViewActive();
        if (isTempStorageEmpty) {
            console.log("Service worker: Checking stored data on the client");
            port.postMessage({type: 'request-stored-data', payload: null});
        }
        
    }

    if (event.data.type === "allow-notifications") {
        console.log("Service worker will: Allow notifications");
        if (event.data.payload) {
            notificationPermission = true;
        }
    }

    if (event.data.type === "get-data-update") {
        
        console.log("Service worker: Getting Data from client");
        if (event.data.payload === null) {
            console.log("Service Worker: Client has not data")

            if (isTempStorageEmpty()) {
                queryPlantDataServer()
                .then((result) => {
                    /*if(!compareData(storageSW.data, result)) {
                        storageSW.data = result;
                    }
                    */
                    
                    if (showNotifications && notificationPermission) {
                        let required = isNotificationRequired(result);
                        if (required.needed) {
                            
                            console.log("Service worker: Notification required: from get-data-update event");
                            console.log("permission: ", notificationPermission, "show: ", showNotifications);
                            
                            serveNotification(required);
                        }
                    }
                    storageSW.needsSync = true;
                    storageSW.data = result;
                    console.log("SW - Updating client data, after DB query:")
                    port.postMessage({type: "get-data-update", payload: result});
                }).catch((error) => {
                    console.error("Service worker: Error getting data from server: ", error);
                }
                );
            }
            else {
                console.log("SW- Updating client data, without DB query")
                port.postMessage({type: "get-data-update", payload: storageSW.data});
            }
        }
        else {
            console.log("SW - updating local data using client data");

            storageSW.data = event.data.payload;
            queryPlantDataServer()
                .then((result) => {
                    /*if(!compareData(storageSW.data, result)) {
                        storageSW.data = result;
                    }
                    */
                    

                    storageSW.needsSync = true;
                    storageSW.data = result;
                    console.log("SW - Updating client data, after DB query:")
                    port.postMessage({type: "get-data-update", payload: result});
                });
            console.log("BAAR: ", storageSW.data)
        }
    }

    if (event.data.type === "view is inactive") {
        showNotifications = true;
        console.log("Service worker: View is inactive");
    }
    /*
    if (event.data.type === "request-stored-data") {
        if
        storageSW.data = event.data.payload;
    }
        */
        
});


// Listen for sync events
self.addEventListener("sync", (event) => {
    if (event.tag === "syncNotifications") {
        storageSW.needsSync = true;
        event.waitUntil(() => {
            if (storageSW.needsSync) {
                serveNotification("From sync event!");
            }
        });
    }
});


self.addEventListener("install", (event) => {
});




self.addEventListener("activate", (event) => {
    
    setInterval(() => {
        queryPlantDataServer()
        .then((result)=>{
          
            if (showNotifications && notificationPermission) {
                let required = isNotificationRequired(result);
                if (required.needed) {

                    console.log("Service worker: Notification required: from active event");
                    console.log("permission: ", notificationPermission, "show: ", showNotifications);
               
                    serveNotification(required);
                }
            }
            storageSW.needsSync = true;
            storageSW.data = result;
            /*
            if(!compareData(storageSW.data, result)) {
                storageSW.data = result; 
                storageSW.needsSync = true;
                serveNotification("From active event");
            }
            */
            //if (Object.keys(storageSW.data).length > 0 && )

            return result;
        }).then((d)=>{
            if (storageSW.needsSync && port) {
                console.log("SW: Data on Plant Data Server changed, updating data on client.");
                storageSW.needsSync = false;
                port.postMessage({type: "get-data-update", payload: d});
            }
        }).catch((error) => {
            console.error("Service worker: Error getting data from server: ", error);
        }
        );
    }, 1000);

});
/*
const cacheFirst = async (request) => {
    const cached = await caches.match(request);
    // fetch function carries out a request4
    return cached ?? fetch(request);
}

// highjack fetch requests from client to server
self.addEventListener("fetch", (event) => {
    
    
    console.log("fetch intercepted: ", event.request.url);
    //event.respondWith(cacheFirst(event.request));
});
*/

