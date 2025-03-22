window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        
        navigator.serviceWorker.register('./service-worker.js', { scope: '/' }).then((registration) => {
            console.log('Service Worker registered: ');
    
        
        }).catch((registrationError) => {
            
            console.log('Service Worker registration failed: ', registrationError);
        
        });

    }
});