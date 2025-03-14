const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        return;
    }

    // Registering the service worker
    try {
        
        const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
        // Then later, request a one-off sync:

        if (registration.installing) {
            
            console.log('Service worker installing');
        }
        else if (registration.waiting) {
              

            console.log('Service worker installed');
        }
        else if (registration.active) {
            // send a message to the service worker
            /*
            const data = localStorage.getItem('plant_data');
            if (data) {
                registration.active.postMessage({ data: JSON.parse(data) });
            }*/
            

            console.log('Service worker active');
        }
    }
    catch (error) {
        console.error('Service Worker registration failed:', error);
    }
} 

async function syncNotifications() {
    const registration = await navigator.serviceWorker.ready;
    registration.sync.register('syncNotifications');
}



window.addEventListener('load', e => {
    console.log("Service Worker: Registering...");
    registerServiceWorker();
    syncNotifications();
});
