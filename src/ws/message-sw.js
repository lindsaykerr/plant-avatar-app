/**
 * Author: Lindsay C Kerr
 */
async function openSWChannel() {

  
    // wait fro the service worker to be ready
   

    return await navigator.serviceWorker.ready.then((registration) => {
        console.log("Creating a channel to SW:");
        
        /*
        // register the sync event
        registration.sync.register('syncNotifications');
        */
        // create a message channel
        const channel = new MessageChannel();

        // send the port to the service worker
        registration.active.postMessage({type: "connect", port: channel.port2}, [channel.port2]);
        
        return {active: true, channel: channel, registration: registration};

    
    }).catch((error) => {
        console.error("Service Worker registration failed: ", error);
        return false;
    }
    );

}

export {openSWChannel};
