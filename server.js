var PATH_PUBLIC = "public";
var PATH_SCSS = "scss/style.scss";

// Require modules
var express = require('express');
var app = express();
var nunjucks = require('nunjucks');
var sass = require('node-sass');
var fs = require('fs');

// Configure Express
app.use(express.static(PATH_PUBLIC));

// Configure Nunjucks
var templates = process.env.NODE_PATH ? (process.env.NODE_PATH + '/templates') : 'templates';
nunjucks.configure(templates, {
    autoescape: true,
    cache: false,
    express: app
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

// Routes
app.get('/', function(req, res) {
    res.render('index', {
        'title': 'Index'
    });
});

// Start server
var server = app.listen(8081, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Server listening on port %s", port);
});
