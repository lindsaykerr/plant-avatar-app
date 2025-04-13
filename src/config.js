const DEBUG_EFS = true;

const BASE_SERVER_URL = {
    LOCALTESTING: 'http://localhost:7070/api/v1',
    TESTING: 'https://devlab.linzk.net/plant-server/api/v1',
};

const RESOURCE = {
    GET_PLANT_DATA: 'GET_PLANT_DATA',
    GET_EMOTIVE_NOTIFICATION: 'GET_EMOTIVE_NOTIFICATION',
    GET_EMOTIVE_RESPONSE: 'GET_EMOTIVE_RESPONSE',
    POST_PLANT_DATA: 'POST_PLANT_DATA',
};


function getREQUEST_URI(BASE_SERVER_URL, RESOURCE) {
    
    const REQUEST_URI = {
        'GET_PLANT_DATA': '/data/1/latest',
        'GET_EMOTIVE_NOTIFICATION':'/emotive/notification',
        'EMOTIVE_RESPONSE':'/emotive/response',
    }
    return BASE_SERVER_URL + REQUEST_URI[RESOURCE]
};

function postREQUEST_URI(BASE_SERVER_URL, RESOURCE) {
    
    const REQUEST_URI = {
        'POST_PLANT_DATA':'/submit',
    }
    return BASE_SERVER_URL + REQUEST_URI[RESOURCE]
}

export {DEBUG_EFS, BASE_SERVER_URL, RESOURCE, getREQUEST_URI, postREQUEST_URI};
