importScripts('service-worker/data-server.js');
importScripts('service-worker/efs.js');


class WSNotification {
    constructor(notificationObj) {
        this.interval_start = notificationObj.interval ?? 1000;
        this.interval_increment = notificationObj.interval_increment ?? 10000;
        this.max_attempts = notificationObj.max_attempts ?? 3;
        this.attempts = notificationObj.attempts ?? 0;
        this.messages = [];
        this.type = "";
        this.list = [];
        this.sendDateTime = null;
    }

    addMessages(messageArray) {
        this.messages = messageArray;
    }
    setType(type) {
        this.type = type;
    }
    setTitle(title) {
        this.title = title;
    }
    setSendDateTime(date) {
        this.sendDateTime = date;
    }
    buildList() {
        if (this.sendDateTime != null && this.type !== "" && this.title !== "" && this.messages.length > 0) {
            const notifydate = this.sendDateTime + this.interval_start
            if (this.list.length == 0) {
                for (let i = 0; i < this.max_attempts; i++) {
                    this.list.push({
                        type: this.type,
                        title: this.title,
                        message: this.messages[i],
                        sendDateTime: notifydate + (this.interval_increment * i),
                    });
                }
            }
        }
    }    
}



class Notifications {
    static permissions = false;
    static show = false;
    static currentNotification = null;
    static lastReading = 12;

    static notificationTypes = {
        overwatered: "overwatered",
        underwatered: "underwatered",
        beyond_acceptable: "beyond_acceptable",
        ideal: "ideal",
        watered: "watered",
        acceptable: "acceptable",
    }
  
    /**
     * Notification messages from the plants perspective
     * 0 - positive, 1 - neutral, 2 - negative
     * 
     * @static
     * @memberof Notifications
     * @type {Object}
     */
    static notificationMessages = {
   
        'overwatered': ["😩 I have had enough water, thank you.", "Too much water", "I'm drowning! STOP watering me!"],
        'underwatered': [ "Can I have some water please?! 🥺", "I'm so thirsty!! 😩","Give me water💧 NOW!!!"],
        'beyond_acceptable': ["😵 I'm dying here!!!", "I this carries on, I might really just die.", "YOU ARE KILLING ME!!!"],
        'ideal': ["Thanks for looking after me. 🌱", "😁 Feeling good! ", "..."],
        'watered': ["Yay, water 😁", "I'm getting a drink 💧👌", "Its about time. 😏"],
        'acceptable': ["Doing well 😊", "😑 Things are okay...", "😅 I'm ALIVE... just."]
    }  

    static canSend() {
        return Notifications.show && Notifications.permissions;
    }

    static canNotify(plantData) {
        const reading = plantData.reading;
        const min_moisture = plantData.moisture_min;
        const max_moisture = plantData.moisture_max;
  
        if (Notifications.currentNotification != null) {
            return false;
        }

        return (reading <= min_moisture || reading >= max_moisture);
        
    }

    static buildNotificationData(plantData, notificationParamsObj) {
        Notifications.lastReading = plantData.reading;
        const reading = plantData.reading;
        const min_moisture = plantData.moisture_min;
        const max_moisture = plantData.moisture_max;
        const wsNotification = new WSNotification(notificationParamsObj);
        Notifications.currentNotification = wsNotification;
        // set type
        if (reading <= min_moisture) {
            wsNotification.setType(Notifications.notificationTypes.underwatered);
        }
        else {
            wsNotification.setType(Notifications.notificationTypes.overwatered);
        }

        wsNotification.addMessages(Notifications.notificationMessages[wsNotification.type]);
        

        wsNotification.setTitle(plantData.name + ":");

        if (wsNotification.sendDateTime == null) {
            wsNotification.setSendDateTime(Date.now());
        }

        wsNotification.buildList();

        
        return wsNotification.list;
    }

    static send(wsNotificationList){

            wsNotificationList.forEach((notification) => {
                console.log("SW Notification time difference (ms): ", notification);
                const id = setTimeout(() => {
                    if (Notifications.canSend()) {
                        Notifications.#showNotification(notification);
                    }
                    else {
                        Notifications.currentNotification = null;
                    }
                    //console.log("Notification sent times: ", notification.sendDateTime);
                }, notification.sendDateTime - Date.now());

            });
           
            
    }

    static #showNotification = (notificationItem) => {
       
    
        self.registration.showNotification(`${notificationItem.title}`, {
            
            body: `${notificationItem.message}`,
            icon: "/images/notification-icon.png"
        });
  
        
    }
}


    
let port;
  
/*** STORAGE, VARIABLES and CACHING ***/
console.log("Service worker: Starting...NOW");
// temp storage object for the service worker


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

let client;


/*** SERVICE WORKER EVENTS/API ***/

// listen for incoming messages from the client app
self.addEventListener('message', (event) => {

    // if a message is received from the client app that the app is open
    // then set the appActive flag to true
    if (event.data.type === 'view is active') {
        
        console.log("Service worker: View is active");
        Notifications.show = false;
        Notifications.currentNotification = null;
        // update port after inactivity
       
    }
          

    if (event.data.type === "connect") {
        port = event.ports[0];
        port.start();
        console.log("Service worker: Port connected");
        Notifications.show = false;
        

         

        
        if (isTempStorageEmpty()) {
            console.log("Service worker: Checking stored data on the client");
            port.postMessage({type: 'request-stored-data'});
        }
        
    }

    if (event.data.type === "allow-notifications") {
        console.log("Service worker will: Allow notifications");
        if (event.data.payload) {
            Notifications.permissions = true;
           
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
                   
                    
                    if (Notifications.canSend() && Notifications.canNotify(result)) {
                      
                        Notifications.send(
                            Notifications.buildNotificationData(result, storageSW.notification)
                        );
                    }
                    console.log("SW - Result: ", result, "Storage: ", storageSW);
                    if (storageSW.data.reading !== result.reading) {
                        port.postMessage({type: "get-data-update", payload: result});
                        storageSW.data = result;
                    }
                    
                   
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
            storageSW.data = event.data.payload;
        }
    }

    if (event.data.type === "view is inactive") { 
        console.log("Service worker: View is inactive");
        Notifications.show = true;
       
    }

});


// Listen for sync events
/*
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
*/


async function loadPlantData() {
    setInterval(() => {
        if (port) {
            queryPlantDataServer()
            .then((result)=>{
                console.log("SW - notification: ", Notifications.permissions, Notifications.show);
                if (Notifications.canSend() && Notifications.canNotify(result)) {
                    Notifications.send(
                        Notifications.buildNotificationData(result, storageSW.notification)
                    );
                }
                

                if (storageSW.data.reading !== result.reading) {
                    port.postMessage({type: "get-data-update", payload: result});
                    storageSW.data = result;
                }
            }).catch((error) => {
                console.error("Service worker: Error getting data from server: ", error);
            });
        }
        else {
            console.log("Service worker: No port connection");
        }
    }, 3000);
}

loadPlantData();

self.addEventListener("install", (event) => {
    //loadPlantData();
});

self.addEventListener("fetch", (event) => {
    console.log("Service worker: Fetch event: ", event);
});



self.addEventListener("activate", (event) => {
    
    
    //loadPlantData();
    /*

    let tempData = {};
    const intervalQuery = async () => {      
        const tempData = {};      

        setInterval(() => {

            queryPlantDataServer()
            .then((result)=>{
                tempData = result;
            }).catch((error) => {
                console.error("Service worker: Error getting data from server: ", error);
            });
     
 
        }, 3000);
    
    };
    event.waitUntil(intervalQuery);

    setInterval(() => {
        if (port) {
            port.postMessage({type: "view is active"});    
            console.log("SW - notification: ", Notifications.permissions, Notifications.show);
            if (Notifications.canSend() && Notifications.canNotify(result)) {
                Notifications.send(
                    Notifications.buildNotificationData(result, storageSW.notification)
                );
            }
            

            if (storageSW.data.reading !== tempData.reading) {
                port.postMessage({type: "get-data-update", payload: result});
                storageSW.data = result;
            }
        }
        else {
            console.log("Service worker: No port connection");
        }
    }, 3000);

    */

});




