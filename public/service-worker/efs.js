/*
 * Author: Lindsay C Kerr
 * Date: 15th March 2025
 * 
 * This file queries the Emotional Framweork Server (EFT) from a service worker.
 * There is one POST query and two GET queries.
 * 
 * The POST query is used to send the plant sensor data to the server. The EFS will use this 
 * information, to determine which affective response is given to the user.
 * 
 * The GET queries are used to get the user's affective response. The response comes in two forms:
 * 1. An emotive notification that will tell the user on behalf of a plant to open carry out a certain action.
 * 2. Emotive response data which will be used to select the appropriate avatar action in the client app.  
 *   
 */

const DEBUG_EFS = true;

const EFS_BASE_SERVER_URL = {
    LOCALTESTING: 'http://localhost:7072/api/v1',
    TESTING: 'http://192.168.0.26:7072/api/v1',
};

const EFS_SERVER_URL = EFS_BASE_SERVER_URL.LOCALTESTING;

const EFS_QUERY_URI = {
    PLANT_DATA: EFS_SERVER_URL + '/data/1/latest',
    EMOTIVE_NOTIFICATION: EFS_SERVER_URL + '/emotive/notification',
    EMOTIVE_RESPONSE: EFS_SERVER_URL + '/emotive/response',
};

// update the plant state in the EFS
async function updatePlantState(data) {
    
    console.assert(!DEBUG_EFS, 'Sending Plant Data to EFS (PDtoEFS):');
    fetch(EFS_QUERY_URI.PLANT_DATA, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(data)})
    .then((response) => {
        if (!response.ok) {
            console.assert(!DEBUG_EFS, 'PDtoEFS: Response from server: ', response);
            throw new Error(`PDtoEFS: HTTP error! status: ${response.status}`);
        }
        return response.json();
    }
    )
    .then((data) => {
        console.log('Plant data sent to server: ', data);
        return true;
    })
    .catch((error) => {
        console.error('Error:', error);
        return false;

    });
}

// query the server for the emotive notification
async function queryEmotiveNotification() {
    console.log('Attempting Emotive Notification Request (ENR):');
    fetch(EFS_QUERY_URI.EMOTIVE_NOTIFICATION)
    .then((response) => {
        if (!response.ok) {
            console.log('ENR: Response from server: ', response);
            throw new Error(`ENR: HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
        console.log('ENR: notification: ', data);
    })
    .catch((error) => {
        console.error('ENR: Error:', error);
    });
}

// query the server for the emotive response
async function queryEmotiveResponse() {
    console.log('Attempting Emotive Response Request (ERR):');
    fetch(EFS_QUERY_URI.EMOTIVE_RESPONSE)
    .then((response) => {
        if (!response.ok) {
            console.log('ERR: Response from server: ', response);
            throw new Error(`ERR: HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
        console.log('ERR: response: ', data);
    })
    .catch((error) => {
        console.error('ERR: Error:', error);
    });
}

