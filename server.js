var PATH_PUBLIC = "public";
var PATH_SCSS = "scss/style.scss";

// Require modules
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
var sass = require('node-sass');
var fs = require('fs');
var jsondb = require('./jsondb.js');
var common = require('./common.js');
var simpleapi = require('./simpleapi.js');
var routes = require('./routes.js');
var websocket_server = require('./websocket_server.js');

// Configure Express
app.use(express.static(PATH_PUBLIC));

// Configure Nunjucks
var templates = process.env.NODE_PATH ? (process.env.NODE_PATH + '/templates') : 'templates';
nunjucks.configure(templates, {
    autoescape: true,
    cache: false,
    express: app,
    watch: true
});

// Compile SCSS
sass.render({
    file: PATH_SCSS,
    outputStyle: 'compressed'
}, function(err, result) {
    if (err) return console.log(err);

    fs.writeFile(PATH_PUBLIC + "/style.css", result.css, function(err) {
        if (err) return console.log(err);
    }); 
});

// Use Nunjucks as template engine
app.set('view engine', 'nunjucks');

app.use(bodyParser.json()); // for parsing application/json
app.use(function(req, res, next) { // Dev middleware to recompile SCSS on every page load
    if (req.method === 'GET') { 
        sass.render({
            file: PATH_SCSS,
            outputStyle: 'compressed'
        }, function(err, result) {
            if (err) return console.log(err);

            fs.writeFile(PATH_PUBLIC + "/style.css", result.css, function(err) {
                if (err) return console.log(err);
            }); 
        });
    }

    next();
});

simpleapi.init(app);
simpleapi.setBaseUrl("/api");
simpleapi.registerSingletonResource("config", {
    "event_key": "string",
    "event_name": "string",
    "is_red_left": "boolean",
    "flip_score_colors": "boolean",
    "max_tower_strength": "number",
    "num_qualification_matches": "number"
});
simpleapi.registerResource("team", {
    "number": "number",
    "name": "string"
}, "number");
simpleapi.registerResource("match", {
    "key": "string",
    "time": "number",
    "alliances": {
        "red": {
            "score": "number",
            "teams": "array"
        },
        "blue": {
            "score": "number",
            "teams": "array"
        }
    }
}, "key");

// Routes
routes.addWebcastRoutes(app);

// Configure error handling
app.use(function(err, req, res, next) {
    if (!err.stack) {
        res.status(500).json({
            "error": err
        });
        return;
    }

    var errorClass = (/^(.*?):/g).exec(err.stack)[1];

    res.status(500).json({
        "class": errorClass,
        "error": err.message,
        "trace": common.parseStack(err.stack)
    });
});

// Start server
var server = app.listen(8081, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Server listening on port %s", port);
});

// Start websocket server
websocket_server.init(server);
