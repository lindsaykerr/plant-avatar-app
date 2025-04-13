/**
 * Author: Lindsay C Kerr
 */
async function RegServiceWorker() {
    const result = await navigator.serviceWorker.register('./service-worker.js', { scope: '/' });
    return result;
}


export {RegServiceWorker}
