# PROTOTYPE PAAC APP FOR AHCI MODULE (BUGGY)

Make sure plant-data-server is running in the background

## Install instructions:
Ensure node and npm are installed then try run 'npm install' to install dependencies.
'npx vite' to run the dev

Can run locally on Edge, but make sure that 'Enable Service Workers over HTTP (when toolbox is open)' is ticked, which can be found in the browsers web developer tools -> setting (F1) panel.

If notification don't stop? 😅 then simply delete browser history for the past hour or 24 and close the browser. 

## App Instructions
Hidden menu can be toggled off and on, clicking in the lower right corner.

### Walkthrough
To run walkthrough, click allow notification, then select the scenario "NEED_WATER" from the dropdown.
Quickly toggle the menu off, and minimise the screen. Wait a few seconds a notification will appear. There should be three in total that will appear if you do not maximise the browser. 

Maximise the browser, a popup dialogue should appear, which is a user valence self evaluation. Avatar responses will change depending on the user response.  

### Mimicking remote sensor change
Animations can be triggered by making a json POST request {"value": int[1-10] } eg {"value": 4} to the plant-data-server which can also be run locally. Request using POSTMAN or SoupUI can be made to http://127.0.0.1:7070/api/v1/submit

## end