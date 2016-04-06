// --- Match timing ---
//
// Durations of the different match periods, in seconds.
// AUTO_LENGTH: Duration of autonomous.
// TELEOP_LENGTH: The duration of teleop, including the endgame time.
// WARNING_LENGTH: The duration of the warning period or endgame. This is considered part of teleop.

var AUTO_LENGTH = 15;
var TELEOP_LENGTH = 135;
var WARNING_LENGTH = 30;

var MATCH_LENGTH = AUTO_LENGTH + TELEOP_LENGTH;

var matchState = {};

function setLeftRightColors(isRedLeft, flipScoreColors) {
    var leftColor = isRedLeft ? 'red' : 'blue';
    var rightColor = isRedLeft ? 'blue' : 'red';

    if (flipScoreColors) {
        $('.alliance-color.score.left').removeClass('alliance-color').addClass(rightColor);
        $('.alliance-color.score.right').removeClass('alliance-color').addClass(leftColor);
        $('.alliance-color.teams.left').removeClass('alliance-color').addClass(rightColor);
        $('.alliance-color.teams.right').removeClass('alliance-color').addClass(leftColor);
    }

    $('.alliance-color.left').removeClass('alliance-color').addClass(leftColor);
    $('.alliance-color.right').removeClass('alliance-color').addClass(rightColor);
}

function setEventName(name) {
    $('.info-text.event').text(name);
}

function setRedScore(score) {
    $('.score.red').text(score);
}

function setBlueScore(score) {
    $('.score.blue').text(score);
}

function setRedTowerStrength(strength) {
    $('.castle.red').attr('data-strength', Math.max(strength, 0));
    $('.castle.red .castle-strength').text(strength);

    var fillHeightPercent = (Math.max(0, strength) / config['max_tower_strength']) * 100;
    $('.castle.red .castle-fill').css('height', fillHeightPercent + '%');
}

function setBlueTowerStrength(strength) {
    $('.castle.blue').attr('data-strength', Math.max(strength, 0));
    $('.castle.blue .castle-strength').text(strength);

    var fillHeightPercent = (Math.max(0, strength) / config['max_tower_strength']) * 100;
    $('.castle.blue .castle-fill').css('height', fillHeightPercent + '%');
}

function setRedTeams(teams) {
    for (var i = 0; i < 3; i++) {
        $('.teams.red .team').eq(i).text(teams[i]);
    }
}

function setBlueTeams(teams) {
    for (var i = 0; i < 3; i++) {
        $('.teams.blue .team').eq(i).text(teams[i]);
    }
}

function setRedDefenseStrengths(strengths) {
    for (var i = 0; i < 5; i++) {
        var defense = $('.defenses.red .defense').eq(i);
        $(defense).attr('data-strength', strengths[i]);
    }
}

function setBlueDefenseStrengths(strengths) {
    for (var i = 0; i < 5; i++) {
        var defense = $('.defenses.blue .defense').eq(i);
        $(defense).attr('data-strength', strengths[i]);
    }
}

function setOfficialReviewActive(active) {
    if (active) {
        $('.timer-scores').addClass('official-review');
    } else {
        $('.timer-scores').removeClass('official-review');
    }
}

function setMatchDescriptionFromKey(key) {
    var qm_re = /qm(\d+)/;
    var qf_re = /qf(\d+)m(\d+)/;
    var sf_re = /sf(\d+)m(\d+)/;
    var f_re = /f(\d+)m(\d+)/;

    var desc = '';
    var match;
    if (qm_re.test(key)) {
        match = qm_re.exec(key);
        desc = 'Qualification ' + match[1] + ' of ' + config['num_qualification_matches'];
    } else if (qf_re.test(key)) {
        match = qf_re.exec(key);
        desc = 'Quaterfinal ' + match[1] + ' Match ' + match[2];
    } else if (sf_re.test(key)) {
        match = sf_re.exec(key);
        desc = 'Semifinal ' + match[1] + ' Match ' + match[2];
    } else if (f_re.test(key)) {
        match = f_re.exec(key);
        desc = 'Final ' + match[1] + ' Match ' + match[2];
    } else {
        console.log('Didn\'t recognize key `' + key + '`');
    }

    $('.info-text.match').text(desc);
}

function resetMatch() {
    setRedScore(0);
    setBlueScore(0);
    setRedTowerStrength(config['max_tower_strength']);
    setBlueTowerStrength(config['max_tower_strength']);
}

function updateTimer() {
    // Quit early if no active match
    if (matchState['period'] == 'inactive') {
        $('.timer-count').text(AUTO_LENGTH);
        $('.timer-fill').css('width', 0);
        $('.timer-fill').removeClass('red yellow');
        return;
    }

    // Stop in our tracks if canceled
    if (matchState['period'] == 'canceled') {
        $('.timer-fill').addClass('red');
        return;
    }

    // Update timer count
    var secondsFromAuto = Math.floor((Date.now() - parseInt(matchState['start_time'])) / 1000);
    var secondsFromTeleop = Math.floor((Date.now() - parseInt(matchState['teleop_time'])) / 1000);

    var output;
    if (matchState['period'] == 'autonomous') {
        output = AUTO_LENGTH - secondsFromAuto;
    } else {
        output = TELEOP_LENGTH - secondsFromTeleop;
    }

    if (output < 0) {
        output = 0;
    }

    $('.timer-count').text(output);

    // Update timer fill
    var secondsFromMatchStart;
    if (matchState['period'] == 'autonomous') {
        secondsFromMatchStart = Math.min(secondsFromAuto, AUTO_LENGTH);
    } else {
        secondsFromMatchStart = Math.min(AUTO_LENGTH + secondsFromTeleop, MATCH_LENGTH);
    }

    timerWidth = (secondsFromMatchStart / MATCH_LENGTH) * 100;
    $('.timer-fill').css('width', timerWidth + "%");

    var secondsToMatchEnd = MATCH_LENGTH - secondsFromMatchStart;
    if (secondsToMatchEnd === 0) {
        $('.timer-fill').addClass('red');
    } else if (secondsToMatchEnd <= WARNING_LENGTH) {
        $('.timer-fill').addClass('yellow');
    } else {
        $('.timer-fill').removeClass('red yellow');
    }
}

function handleMessage(e) {
    var msg = JSON.parse(e.data);
    console.log(msg);
    if (msg.type == 'match_update') {
        matchState = msg.match_state;
        setRedScore(matchState.scores.red);
        setBlueScore(matchState.scores.blue);
        setRedTeams(matchState.info.teams.red);
        setBlueTeams(matchState.info.teams.blue);
        setRedDefenseStrengths(matchState.defense_strengths.red);
        setBlueDefenseStrengths(matchState.defense_strengths.blue);
        setRedTowerStrength(matchState.tower_strengths.red);
        setBlueTowerStrength(matchState.tower_strengths.blue);
        setOfficialReviewActive(matchState.official_review);
        setMatchDescriptionFromKey(matchState.info.match_key);
    }
}

$(document).ready(function() {
    getConfig(function() {
        setLeftRightColors(config['is_red_left'], config['flip_score_colors']);
        setEventName(config['event_name']);
        resetMatch();
    });
    setInterval(updateTimer, 50);
    setInterval(ensureWebSocketConnection, 10000);

    addWebSocketMessageListener(handleMessage);
    sendWebSocketMessage('{"message_type": "register", "client_type": "live"}');
});
