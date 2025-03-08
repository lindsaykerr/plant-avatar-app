import './style.css'



// first check to see if the browser supports service workers
if ('serviceWorker' in navigator) {
  // when the window loads, register the service worker
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceworker.js')
      .then(registration => {
        console.log('Service Worker registered: ', registration);
      })
      .catch(registrationError => {
        console.log('Service Worker registration failed: ', registrationError);
      });
  });
}
/*
const div_worker =  document.querySelector("#test-worker")
if (window.Worker) {
  const worker = new Worker(new URL('/src/scripts/plant_data_webworker.js', import.meta.url))
  worker.onmessage = ({ data }) => {
    if (data.error) {
      div_worker.innerHTML = `Error: ${data.error}`;
      console.error('Worker error:', data.error)
    }
    else {
      const keys = Object.keys(data);
      let str = '';
      keys.forEach(key => {
        str += `${key}: ${data[key]}<br>`;
      });
      div_worker.innerHTML = `Data from server:<br> ${str}`;
      console.log('Worker said:', data)
    }
  }

  worker.postMessage('Hello from the main thread!')
}
document.querySelector('#app').innerHTML = `<div>Testing...</div>`;
*/


/*
document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`
*/

