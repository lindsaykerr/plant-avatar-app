/*
 * Author: 	Lindsay C Kerr
 * Date: 	15th March 2025
 * 
 * This file queries the plant sensor data from a server, which is handled by a service worker.
 * 
 */

/*** SERVER_URL Settings ***/
const DS_BASE_SERVER_URL = {
    LOCALTESTING: 'http://localhost:7070/api/v1',
    TESTING: 'https://devlab.linzk.net/plant-server/api/v1',
};

const DS_SERVER_URL = DS_BASE_SERVER_URL.LOCALTESTING;

const DS_QUERY_URI = {
    PLANT_DATA: DS_SERVER_URL + '/data/1/latest',
};


/*** SERVER REQUEST FUNCTION ***/
/**
 * This function queries the plant sensor data from the server.
 
 * 
 * @param {Object} storage - This references an object which is being used a storage. It will have a property 
 * named data which is used to store the plant sensor data. This in turn must have a property named recorded_at
 * providing the time the data was recorded. The storage object will also have a property named needsSync which
 * is used to determine if the data needs to be synced with the client app. 
 * 
 * @param {Function} isAppActiveCallback - This is a callback function that is used to check if the client app is active.
 * it will contain the postMessage function to send a message to the client app to check if it is active.
 * 
 */
const DEBUG_DS = true;

async function  queryPlantDataServer () {
    
    DEBUG_DS ? console.log('Attempting to fetch data from the Plant Data Server (FPD): ') : () => {};
    return await fetch(DS_QUERY_URI.PLANT_DATA)
    .then((response) => {
        if (!response.ok) {
            DEBUG_DS ? console.log("FPD: Response form server: ", response) : () => {};
            throw new Error(`FPD: HTTP error! status: ${response.status}`);
        }
        return response.json();
    }).catch((error) => {
        console.error("FPD:Error fetching data: ", error);

        return null;
    });
}

function compareData(data1, data2) {
    return JSON.stringify(data1) === JSON.stringify(data2);
}



