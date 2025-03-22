
import {openSWChannel} from './scripts/message-sw.js';


// postManager object, provides the references to objects which allow for 
// posting messages to the service worker to take place. Only after a communication 
// channel has been established with the service worker and the client app.
let postManager;

function postToSerivceWorker(message) {
    if (postManager && postManager.active) {
        postManager.registration.active.postMessage(message);
    }
}

window.addEventListener('load', e => {
    
    

    /*
     * Check if the service worker is supported and register it
     * if it is supported, then open a channel to the service worker
     * register the communication channel with a postManger that will
     * all for posting messages to the service worker from various 
     * parts of the app. 
     */
    if ("serviceWorker" in navigator) {    
        openSWChannel().then(result => {
            postManager = result;
            console.log("Local Data", localStorage.getItem('plants_data'))
            if (localStorage.getItem('plants_data') === null || localStorage.getItem('plants_data') === "{}") {
                console.log("Client: Getting data from server");
                postToSerivceWorker({type: 'get-data-update'});
            }

            postManager.channel.port1.onmessage = (event) => {
                        // listen for messages from the service worker
     
        
                if (event.data.type === "is view active") { 
                    console.log("Client: Sending view is active ");
                    postManager.registration.active.postMessage({type: "view is active", view: true});
                }
                

                if (event.data.type === "get-data-update") {
                    console.log('Client: Updating data from service worker');
                    localStorage.setItem('plants_data', JSON.stringify(event.data.payload));
                }
   
                if (event.data.type === "request-stored-data") {
                    console.log('Client: Sending data to service worker');
                    const data = localStorage.getItem('plants_data');
                    postToSerivceWorker({type: 'get-data-update', payload: JSON.parse(data)});
                }
            }
        }).catch(error => {
            console.log("Client: SW Communiction channel could not be establishe")
        });
        
     
        
    } else {
        console.log("Service Worker not supported");
        // app will not work without service worker
    }

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
    /*
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