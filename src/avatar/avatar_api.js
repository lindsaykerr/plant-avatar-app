const AVATARSTATES = {
    happy: 'happy',
    angry: 'angry',
    idle: 'idle',
    depressed: 'depressed',
    happy_v2: 'happy_v2',
    angry_v2: 'angry_v2',
    depressed_v2: 'depressed_v2'
};

const avatar = {
    currentState: null, 
    stateChange: false,
};

function setCurrentState(state){
    avatar.stateChange = true;
    avatar.currentState = state;
}

function hasStateChanged(){
    return avatar.stateChange;
}

function getCurrentState(){
    avatar.stateChange = false;
    return avatar.currentState;
}

export {AVATARSTATES, hasStateChanged, setCurrentState, getCurrentState};