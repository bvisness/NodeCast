var DATA_PATH = "data";
var TEAMS_FILENAME = "teams.json";
var MATCHES_FILENAME = "matches.json";

var fs = require('fs');
var mkdirp = require('mkdirp');
var strictobject = require('./strictobject.js');

var teams;
var matches;

var initialized = false;

//
// Private functions
// 
function init() {
    if (initialized) {
        return;
    }

    loadData();

    strictobject.registerType("team", {
        "number": "number",
        "name": "string"
    });
    strictobject.registerType("match", {
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
    });

    initialized = true;
}

function loadData() {
    try {
        var teamsRaw = fs.readFileSync(DATA_PATH + "/" + TEAMS_FILENAME);
        teams = JSON.parse(teamsRaw);
    } catch (e) {
        if (e.code === 'ENOENT') {
            mkdirp.sync(DATA_PATH);
            fs.writeFileSync(DATA_PATH + "/" + TEAMS_FILENAME, "{}");
            teams = {};
        } else {
            throw e;
        }
    }

    try {
        var matchesRaw = fs.readFileSync(DATA_PATH + "/" + MATCHES_FILENAME);
        matches = JSON.parse(matchesRaw);
    } catch (e) {
        if (e.code === 'ENOENT') {
            mkdirp.sync(DATA_PATH);
            fs.writeFileSync(DATA_PATH + "/" + MATCHES_FILENAME, "{}");
            matches = {};
        } else {
            throw e;
        }
    }
}

function saveData() {
    function saveError(err) {
        if (err) console.log(err);
    }

    fs.writeFile(DATA_PATH + "/" + TEAMS_FILENAME, JSON.stringify(teams), saveError);
    fs.writeFile(DATA_PATH + "/" + MATCHES_FILENAME, JSON.stringify(matches), saveError);
}

//
// Public functions
// 
function getTeam(teamNumber) {
    init();

    return teams[teamNumber];
}
module.exports.getTeam = getTeam;

function saveTeam(team) {
    init();

    if (!strictobject.isValidInstance(team, "team")) {
        return false;
    }

    teams[team.number] = team;
    saveData();

    return true;
}
module.exports.saveTeam = saveTeam;

function deleteTeam(teamNumber) {
    init();

    if (!teams.hasOwnProperty(teamNumber)) {
        return false;
    }

    delete teams[teamNumber];
    saveData();

    return true;
}
module.exports.deleteTeam = deleteTeam;

function getMatch(matchKey) {
    init();

    return matches[matchKey];
}
module.exports.getMatch = getMatch;

function saveMatch(match) {
    init();

    if (!strictobject.isValidInstance(match, "match")) {
        return false;
    }

    matches[match.key] = match;
    saveData();

    return true;
}
module.exports.saveMatch = saveMatch;

function deleteMatch(matchKey) {
    init();

    if (!matches.hasOwnProperty(matchKey)) {
        return false;
    }

    delete matches[matchKey];
    saveData();

    return true;
}
module.exports.deleteMatch = deleteMatch;
