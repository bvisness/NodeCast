# NodeCast
Webcasting overlays for FRC, built in Node.js

## Installing
Make sure you have [Node.js](https://nodejs.org/) installed. Then open a terminal prompt, navigate to the project root directory and run `npm install`.

## Starting the Server
Open a terminal prompt and navigate to the project root directory. Then run the following:

```
node server.js
```

## Controlling the Overlays
Once the server is up and running, open a web browser and go to `http://localhost:8081/live`. This is the actual overlay that you can use on the stream. The layout is specifically designed for 1920x1080 resolution, so we recommend going full-screen on a separate monitor if possible.

Open another browser window and go to `http://localhost:8081/cp_live`. This is the control panel for the live overlay. Experiment with the different options; what they do should be self-evident.

## Configuring Global Settings
The application saves global settings, such as the event name, number of qualification matches, and visual settings. Currently there is no control panel for these, but you can view and edit them by making GET, PATCH, and PUT requests to `http://localhost:8081/api/config`.

We recommend [Postman](https://www.getpostman.com/) or any other good REST client for making these changes.
