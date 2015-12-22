var DATA_PATH = "jsondb_data";

var common = require('./common.js');
var fs = require('fs');
var mkdirp = require('mkdirp');
var strictobject = require('./strictobject.js');

var db = {};
var types = {};
var primaryKeys = {};

//
// Private functions
// 
function typeIsRegistered(type) {
    return types[type] == true; // Get rid of truthiness
}

function init(type) {
    if (!typeIsRegistered(type)) {
        throw "Unrecognized type " + type;
    }
    if (db[type]) {
        return;
    }

    try {
        var raw = fs.readFileSync(DATA_PATH + "/" + type + ".json");
        types[type] = JSON.parse(raw);
    } catch (e) {
        if (e.code === 'ENOENT') {
            mkdirp.sync(DATA_PATH);
            fs.writeFileSync(DATA_PATH + "/" + type + ".json", "{}");
            db[type] = {};
        } else {
            throw e;
        }
    }
}

function writeToDisk(type) {
    var filename = DATA_PATH + "/" + type + ".json";
    fs.writeFileSync(filename, JSON.stringify(db[type]));
}

function writeAllToDisk() {
    for (var type in types) {
        writeToDisk(type);
    }
}

//
// Public functions
// 
function registerType(name, structure, primaryKey) {
    if (typeIsRegistered(name)) {
        throw "Type " + name + " was already registered";
    }
    if (!primaryKey) {
        throw "You must provide a primary key, " + primaryKey + " provided instead";
    }
    if (!structure.hasOwnProperty(primaryKey)) {
        throw "Structure for type " + name + " does not have primary key " + primaryKey;
    }

    types[name] = true;
    primaryKeys[name] = primaryKey;
    strictobject.registerType(name, structure);
}
module.exports.registerType = registerType;

function getAll(type) {
    init(type);

    return common.cloneObject(db[type]);
}
module.exports.getAll = getAll;

function get(type, id) {
    init(type);

    if (db[type][id]) {
        return common.cloneObject(db[type][id]);
    } else {
        return undefined;
    }
}
module.exports.get = get;

function save(type, object, exceptions) {
    init(type);

    if (!strictobject.isValidInstance(object, type)) {
        if (exceptions === true) {
            throw "Object was not a valid instance of " + type;
        }
        return false;
    }

    var clonedObj = common.cloneObject(object);
    var id = clonedObj[primaryKeys[type]];
    db[type][id] = clonedObj;

    writeToDisk(type);

    return clonedObj;
}
module.exports.save = save;

function remove(type, id, exceptions) {
    init(type);

    if (!db[type].hasOwnProperty(id)) {
        if (exceptions === true) {
            throw "Object " + id + " not found";
        }
        return false;
    }

    delete db[type][id];
    writeToDisk(type);

    return true;
}
module.exports.remove = remove;

function removeAll(type) {
    delete db[type];
    delete types[type];
    delete primaryKeys[type];

    try {
        fs.unlinkSync(DATA_PATH + "/" + type + ".json");
    }
    catch (e) {
        if (e.code !== 'ENOENT') {
            throw e;
        }
    }
}
module.exports.removeAll = removeAll;
