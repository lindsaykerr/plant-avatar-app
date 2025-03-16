


const channel = new MessageChannel();

async function registerServiceWorker() {
   
    if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        return 
    }
    
    navigator.serviceWorker.register('service-worker.js', { scope: '/' }).then((registration) => {
        console.log('Service Worker registered: ');
        return true;
    
    }).catch((registrationError) => {
        
        console.log('Service Worker registration failed: ', registrationError);
        return false;
      
    });

} 

async function syncNotifications() {
    const registration = await navigator.serviceWorker.ready;
    registration.sync.register('syncNotifications');
}



window.addEventListener('load', e => {
    
    if (localStorage.getItem('plants_data') === null) {
        localStorage.setItem('plants_data', JSON.stringify([]));
    }
    if (registerServiceWorker()) {
        console.log("Client: Service Worker registered");
        
        syncNotifications();
    } 
    

});

    
  /* // check first if the service worker is ready to receive messages
navigator.serviceWorker.ready.then((registration) => {
  
    * send an initial message so that it can transfer the communication port, essentaially giving 
    * the service worker a connection port 2 to allow for communication.
  
    
});  */

/*
    (client) p1 <----> p2 (service worker)
*/ 

// listen for incoming messages on port 1 



channel.port1.onmessage = (event) => {
    console.log("Client: Request recieve for 'is view active'");
    if (event.data.type === "is view active") {
        
        channel.port2.postMessage({type: "view is active", payload: "success"});
    }
};