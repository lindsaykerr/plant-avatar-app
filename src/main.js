/**
 * Author: Lindsay C Kerr
 */

import {AVATARSTATES, getCurrentState, setCurrentState} from './avatar/avatar_api.js';

import {openSWChannel} from './ws/message-sw.js';
import { RegServiceWorker } from './ws/setup-service-worker.js';




let viewClosed = false;
let viewWasInactive = false;


function getViewWasInactive() {
    return viewWasInactive;
}

function setViewWasInactive(value) {
    viewWasInactive = value;
}

function checkViewWasInactive() {
    if (viewClosed) {
        viewWasInactive = true;
        viewClosed = false;
    }
}

const notifySound = new Audio('/audio/notify-sound.ogg');
notifySound.preload = 'auto';

function checkMoistureParams(data, previousData) {
    console.log("Assigning moisture parameters");
    if (previousData === null) {
        previousData = {};
        previousData.reading = 0;
    }
    const prevMoisture = previousData.reading; 
    const currentMoisture = data.reading;
    const minMoisture = data.moisture_min;
    const maxMoisture = data.moisture_max;
    const idealMoisture = data.moisture_ideal;

    let state = null
    if (currentMoisture <= minMoisture || currentMoisture >= maxMoisture) {
        if ((prevMoisture >= maxMoisture) && (currentMoisture >= maxMoisture)) {
            console.log("Overwatered");
            state = AVATARSTATES.angry;
            
        }
        else if ((prevMoisture <= minMoisture) && (currentMoisture <= minMoisture)) {
            console.log("Underwatered");
            state = AVATARSTATES.depressed;
            
        } else {

            console.log("Beyond acceptable moisture levels");
            state = AVATARSTATES.depressed_v2;
        }
    }
    else if (currentMoisture == idealMoisture) {
        console.log("Mositure levels are ideal");
        state = AVATARSTATES.happy;
    }
    else if (currentMoisture < maxMoisture && currentMoisture > minMoisture) {
        if (prevMoisture < currentMoisture) {
            console.log("Moisture levels increasing");
            state = AVATARSTATES.happy;
        }
        console.log("Moisture acceptable");
        state = AVATARSTATES.idle;
    }


    setCurrentState(state);


  
}

let postManager;
let tempData = null;

function postToSerivceWorker(message) {
    if (postManager && postManager.active) {
        postManager.registration.active.postMessage(message);
    }
}




// postManager object, provides the references to objects which allow for 
// posting messages to the service worker to take place. Only after a communication 
// channel has been established with the service worker and the client app.



window.addEventListener('load', e => {
    
    if (localStorage.getItem('plants_data') !== null && localStorage.getItem('plants_data').length > 2) {
        const data = JSON.parse(localStorage.getItem('plants_data'));
        const previousData = JSON.parse(localStorage.getItem('prev_plants_data'));
     
        checkMoistureParams(data, previousData);

    }

    /*
     * Check if the service worker is supported and register it
     * if it is supported, then open a channel to the service worker
     * register the communication channel with a postManger that will
     * all for posting messages to the service worker from various 
     * parts of the app. 
     */
    if ("serviceWorker" in navigator) {  
        swAppIntegration();   
    } else {
        console.log("Service Worker not supported");
        // app will not work without service worker
    }

    // TODO - add allow notifications button
   /*
    const allowNotifications = document.getElementById('allow-notifications');
    allowNotifications.addEventListener('click', e => {
        if ("Notification" in window) {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    new Notification(
                        "Granted", {
                            body: "You will be notified",
                        });
                }
            });
        }
        console.log(postManager);
        postToSerivceWorker({type: 'allow-notifications', payload: true});
    });
    
 
 
    const selfEvalReport = document.getElementById('self-report');
    selfEvalReport.addEventListener('animationend', e => {
        selfEvalReport.style.animation = '';
        selfEvalReport.style.display = 'none';
    }
    ); 
        
    const selfEvalButtons = document.querySelectorAll('.self-report-button');
    selfEvalButtons.forEach((button) => {
        button.addEventListener('click', e => {
            const valence = e.target.dataset.valence;
 
            selfEvalReport.style.animation = 'fade-out 1s forwards';

            postToSerivceWorker({type: 'user-self-evaluation', payload: {valence: valence}});
        });

    });
    */


});

let heartbeatId;    

function heartbeat() {
        if (postManager && postManager.registration.active) {
            heartbeatId = setInterval(() => {
                //console.log("Client: Sending heartbeat to service worker");
                postManager.registration.active.postMessage({type: 'heartbeat'});
            }, 10000);
        }
    }

function killHeartbeat() {
    clearInterval(heartbeatId);
}
    

async function swAppIntegration() {



    await RegServiceWorker().catch(error => {
        console.log("Client: Failed to register service worker", error);
    });
    await openSWChannel().then(result => {



        

        postManager = result;
        /*
        if (localStorage.getItem('plants_data') === null || localStorage.getItem('plants_data') === "{}") {
            console.log("Client: Getting data from server");
            postToSerivceWorker({type: 'get-data-update'});
        }
        */
        /*
        setInterval(() => {
            try {
                postManager.registration.active.postMessage({type: 'connect'}, [postManager.channel.port2]);
                console.log("New connection established");
            }   catch (error) {
                console.log("Connection already established");
            }
        }, 3000);
        */

       

        postManager.channel.port1.onmessage = (event) => {
                    // listen for messages from the service worker

            if (event.data.type === "heartbeat response") {
                console.log("Heartbeating...");
            }

            if (event.data.type === "request port") {
                postManager.registration.active.postMessage({type: 'connect'}, [postManager.channel.port2]);
                console.log("Client: Connection established");
            }
            
    
            if (event.data.type === "is view active") { 
                console.log("Client: Sending view is active ");
                postManager.registration.active.postMessage({type: "view is active"});
            }
            

            if (event.data.type === "get-data-update") {
                console.log('Client: Updating data from service worker');

                tempData = event.data.payload;
                let previousData = localStorage.getItem('plants_data');
                localStorage.setItem('prev_plants_data', previousData);
                previousData = JSON.parse(previousData); 
                localStorage.setItem('plants_data', JSON.stringify(event.data.payload));
                console.log("Previous data: ", previousData);
                if (previousData == null || (tempData.reading !== previousData.reading)) {
                    checkMoistureParams(tempData, previousData);
                }
                postManager.registration.active.postMessage({type: 'view is active'});
            }
               
            if (event.data.type === "request-stored-data") {
           
                const data = localStorage.getItem('plants_data');
                if (data === null || data === "{}") {
                    console.log("Client: No data found, requesting update")
                    postToSerivceWorker({type: 'get-data-update', payload: null});
                }
                else {     
                    console.log('Client: Sending data to service worker');
                    postToSerivceWorker({type: 'get-data-update', payload: JSON.parse(data)});
                }
            } 
        
        }    
        heartbeat();
    }).catch(error => {
        console.log("Client: Failed to open communicaion channel service worker")
    });
}


window.addEventListener('beforeunload', () => {
    killHeartbeat();
});

window.addEventListener("visibilitychange", e => {
    if (document.hidden) {
        
        console.log("Client: View is inactive");
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.visibility = 'visible';
        viewClosed = true;
        postToSerivceWorker({type: 'view is inactive'});
    }
    else {
        checkViewWasInactive();
        if (viewWasInactive) {
            setTimeout(() => {
                const loadScreen = document.getElementById('loading-screen');
                loadScreen.style.animation = 'fade-out .5s forwards';
                loadScreen.style.visibility = 'hidden';
            }, 1000);
            postToSerivceWorker({type: 'view is active'});
        }

  
    }
});





/*    
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

    const showCachedData = async () => {
        const cache = await caches.open('v1');
        cache.keys().then((keys) => {
            keys.forEach(async (key) => {
                const response = await cache.match(key);;
                console.log(response);
            });
        });
    }

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
    const appcache = caches.open('app_settings');

});
*/


export {postToSerivceWorker, checkMoistureParams, getViewWasInactive, setViewWasInactive, notifySound};
