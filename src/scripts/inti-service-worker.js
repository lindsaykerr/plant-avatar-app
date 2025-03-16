const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        return;
    }

    // Registering the service worker
    try {
        
        const registration = await navigator.serviceWorker.register('service-worker.js', { scope: '/' });
        // Then later, request a one-off sync:

        if (registration.installing) {
            
            console.log('SW Registration: Installing');
        }
        else if (registration.waiting) {
              

            console.log('SW Registration: Installed');
        }
        else if (registration.active) {
            // send a message to the service worker
            
            const data = localStorage.getItem('plants_data');
            if (data) {
                registration.active.postMessage({ data: JSON.parse(data) });
            }
            console.log('SW Registration: Active');
        }
    
        return navigator.serviceWorker.ready;

    }
    catch (error) {
        console.error('SW Registration failure: ', error);
    }
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
        console.log("SW Registration: Complete");
        navigator.serviceWorker.onmessage = function(event) {
            console.log("Service Worker: Message received from service worker");
            const data = JSON.parse(event.data);
            console.log(data);
        }
    } 
    syncNotifications();

});
