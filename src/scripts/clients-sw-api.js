// To allow for communication between the service worker and the client
// a channel is created and the port is passed to the service worker

(() => {
    const channel = new MessageChannel();
    
    // check first if the service worker is ready to receive messages
    navigator.serviceWorker.ready.then((registration) => {
        /* 
        * send an initial message so that it can transfer the communication port, essentaially giving 
        * the service worker a connection port 2 to allow for communication.
        */
        navigator.serviceWorker.controller.postMessage({type: "connect", payload: "success"},[channel.port2]);  
    });
    
    /*
        (client) p1 <----> p2 (service worker)
    */ 
    
    // listen for incoming messages on port 1 
    channel.port1.onmessage = (event) => {
        if (event.data.type === "is view active") {
    
        navigator.serviceWorker.controller.postMessage({type: "view is active", payload: "success"});
        }
    };
    
    
})();
    