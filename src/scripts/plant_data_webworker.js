
function fetchData() {
    fetch('http://127.0.0.1:7070/api/v1/data/1/latest') // Replace '/api/data' with your actual API endpoint
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        postMessage(data); // Send the fetched data back to the main thread
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        postMessage({ error: error.message }); // Send error back to the main thread
      });
  }
  
  // Initial fetch
  fetchData();
  
  // Set up interval for subsequent fetches
  setInterval(fetchData, 1 * 30 * 1000); // 15 minutes in milliseconds