/**
 * Author: Lindsay C Kerr
 */
import { BASE_SERVER_URL, RESOURCE,getREQUEST_URI, postREQUEST_URI } from "./config.js";
import {postToSerivceWorker, checkMoistureParams, setViewWasInactive, getViewWasInactive, notifySound } from "./main.js";
import {AVATARSTATES, hasStateChanged, setCurrentState, getCurrentState} from './avatar/avatar_api.js';

const SCENARIOS = {
  NEED_WATER: 'need water',
  LIVE: 'live',
  CLEAR: 'clear',
};

const base_server = BASE_SERVER_URL.LOCALTESTING;

class PrototypeController {

  static scenario(value) {
    const scenarios = {
      'need water': () => {
        // START
        // the following setup a scenario for the PAAC prototype
        // the scenario is that the plant needs water
        // the plant data is fetched from the server
        // the plant data is loaded into the local storage
        // an animation is triggered on the avatar
        // the researcher will then make the view inactive and hand the device to the participant
        // within 5min the app will send a notification to the participent that the plant needs water
        // the user will open the app 
        // the app will provide the user with an emotional self evaluation
        // the user will click on one of the options
        // this will trigger an animation on the avatar
        // the user will then water or not water the plant, based on whether the app was effective enough at influencing the user
        // if the user waters the plant, they will see the plant avater change to a happy state
        // if the user does not water the plant, they will see the plant avatar change to a sad state
        // END 
        // 
        console.log("Scenario - NEED_WATER: Attempting to send false sensor data to the server, to simulate the plant needing water");
        fetch(postREQUEST_URI(base_server, RESOURCE.POST_PLANT_DATA), {

          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
          }, 
          body: JSON.stringify({value: 1})
        }).then((response) => {

          if (!response.ok) {
              console.assert(!DEBUG_EFS, 'PDtoEFS: Response from server: ', response);
              throw new Error(`PDtoEFS: HTTP error! status: ${response.status}`);
          }
          console.log("Scenario - NEED_WATER: Sent flase data to server");
          return response.json();
        }).then(()=>{
            console.log("Scenario - NEED_WATER: Attempting to fetch plant data from the server");

            fetch(getREQUEST_URI(base_server, RESOURCE.GET_PLANT_DATA)).then((response) => {
              if (!response.ok) {
                  console.log('ENR: Response from server: ', response);
                  throw new Error(`ENR: HTTP error! status: ${response.status}`);
              }
              return response.json();
            }).then((data) => {
              console.log("Scenario - NEED_WATER: Plant data recieved, attempting to load into storage, update animation");
              localStorage.setItem('plants_data', JSON.stringify(data));
              let prevdata = localStorage.getItem('prev_plants_data');
              if (prevdata == null || prevdata == "{}") {
                prevdata = null;
              }
              checkMoistureParams(data, JSON.parse(localStorage.getItem('prev_plants_data')));
              return true;
            }).then(()=>{

              let active = false;
              const inid = setInterval(() => {
                if (getViewWasInactive()) {
                  setTimeout(() => { 
                    notifySound.play();
                    console.log("Scenario - NEED_WATER: Sending notification to user");
                    const selfReport = document.getElementById("self-report");
                    selfReport.classList.remove("hide");
                    selfReport.style.opacity = 1;
                    selfReport.style.animation = 'fade-in 2s forwards';
               
                  }, 3000);
                  stopInterval();
               
                }
              


              }, 1000);
              function stopInterval() {
                clearInterval(inid);
              }

     


            }).then(()=>{
              const selfEvalButtons = document.querySelectorAll('#self-report .reply-button');
              selfEvalButtons.forEach((button) => {
                  button.addEventListener('click', e => {
                      const valence = e.target.dataset.valence;
                      const selfReport = document.getElementById("self-report");
                      selfReport.style.animation = 'fade-out 1s forwards';
                      selfReport.style.opacity = 0;
                      selfReport.classList.add("hide");
                      const selectAnimation = (v) => {
                        if (v === 'positive') {
                          return AVATARSTATES.idle;
                        } 
                        else if (v === 'negative') {
                          return AVATARSTATES.angry;
                        }
                        else {
                          return AVATARSTATES.depressed;
                        }
                      }

                      setCurrentState(selectAnimation(valence));
                      
                      //postToSerivceWorker({type: 'user-self-evaluation', payload: {valence: valence}});
                  });
       
              });
            });

      });
       
       
      },
      'clear': () =>{
        setViewWasInactive(false);
        localStorage.setItem('prev_plants_data', JSON.stringify({}));
        localStorage.setItem('plants_data', JSON.stringify({}));
        setCurrentState(AVATARSTATES.idle);
        
      }


      
    };

    return scenarios[value]();

  }
}

export { PrototypeController, SCENARIOS };