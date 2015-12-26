var common = require('./common.js');
var jsondb = require('./jsondb.js');

var app = undefined;
var baseUrl = "";

//
// Private functions
// 
function checkInit() {
    if (!app) {
        throw "SimpleAPI must be initialized with an Express app.";
    }
}

//
// Public functions
// 
function init(_app) {
    app = _app;
}
module.exports.init = init;

function setBaseUrl(newBase) {
    baseUrl = "/" + common.trimString(newBase, "/");
}
module.exports.setBaseUrl = setBaseUrl;

function registerResource(name, structure, primaryKey) {
    checkInit();

    jsondb.registerType(name, structure, primaryKey);

    app.get(baseUrl + '/' + name, function(req, res) {
        res.json(jsondb.getAll(name));
    });
    app.get(baseUrl + '/' + name + '/:id', function(req, res) {
        var id = req.params.id;
        var resource = jsondb.get(name, id);

        if (resource) {
            res.json(resource);
        } else {
            res.status(404).json({
                "error": "Resource of type `" + name + "` with key `" + id + "` not found.",
                "trace": common.parseStack(new Error().stack)
            });
        }
    });
    app.post(baseUrl + '/' + name, function(req, res) {
        if (jsondb.get(name, req.body[primaryKey])) {
            res.status(409).json({
                "error": "Object of type `" + name + "` with key `" + req.body[primaryKey] + "` already exists in database.",
                "trace": common.parseStack(new Error().stack)
            });
            return;
        }

        var saveResult = jsondb.save(name, req.body);
        if (saveResult) {
            res.json(saveResult);
        } else {
            res.status(400).json({
                "error": "Failed to save resource of type `" + name + "`. Perhaps the structure did not match the type definition?",
                "trace": common.parseStack(new Error().stack)
            });
        }
    });
    app.put(baseUrl + '/' + name + '/:id', function(req, res) {
        if (req.body[primaryKey] != req.params.id) {
            res.status(400).json({
                "error": "Expected primary key `" + req.params.id + "` in body; saw `" + req.body[primaryKey] + "` instead.",
                "trace": common.parseStack(new Error().stack)
            });
            return;
        }

        var saveResult = jsondb.save(name, req.body);
        if (saveResult) {
            res.json(saveResult);
        } else {
            res.status(400).json({
                "error": "Failed to save resource of type `" + name + "`. Perhaps the structure did not match the type definition?",
                "trace": common.parseStack(new Error().stack)
            });
        }
    });
    app.patch(baseUrl + '/' + name + '/:id', function(req, res) {
        function updateObject(original, modifications) {
            for (var key in modifications) {
                if (!original.hasOwnProperty(key)) {
                    throw "Key `" + key + "` not found in object"; 
                }

                if (common.isRealObject(modifications[key])) {
                    updateObject(original[key], modifications[key]);
                } else {
                    original[key] = modifications[key];
                }
            }

            return original;
        }

        var id = req.params.id;

        var resource = jsondb.get(name, id);
        if (!resource) {
            res.status(404).json({
                "error": "Resource of type `" + name + "` with key `" + id + "` not found.",
                "trace": common.parseStack(new Error().stack)
            });
            return;
        }

        delete req.body[primaryKey];
        resource = updateObject(resource, req.body);

        var saveResult = jsondb.save(name, resource);
        if (saveResult) {
            res.json(saveResult);
        } else {
            res.sendStatus(400);
        }
    });
    app.delete(baseUrl + '/' + name + '/:id', function(req, res) {
        var deleteResult = jsondb.remove(name, req.params.id);
        if (deleteResult) {
            res.sendStatus(204);
        } else {
            res.status(404).json({
                "error": "Resource of type `" + name + "` with key `" + req.params.id + "` not found.",
                "trace": common.parseStack(new Error().stack)
            });
        }
    });
}
module.exports.registerResource = registerResource;
