// --- Match timing ---
//
// Durations of the different match periods, in seconds.
// AUTO_LENGTH: Duration of autonomous.
// PAUSE_LENGTH: Duration of the pause between auto and teleop.
// TELEOP_LENGTH: The duration of teleop, including the endgame time.
// WARNING_LENGTH: The duration of the warning period or endgame. This is considered part of teleop.

var AUTO_LENGTH = 15;
var PAUSE_LENGTH = 1;
var TELEOP_LENGTH = 145;
var WARNING_LENGTH = 20;

var MATCH_LENGTH = AUTO_LENGTH + TELEOP_LENGTH;

var config;
var matchRunning;
var matchStartTime;

function setLeftRightColors(isRedLeft) {
    var leftColor = isRedLeft ? 'red' : 'blue';
    var rightColor = isRedLeft ? 'blue' : 'red';

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

function resetMatch() {
    setRedScore(0);
    setBlueScore(0);
}

function getConfig(callback = function(){}) {
    $.ajax({
        method: 'GET',
        url: '/api/config',
        success: function(data) {
            config = data;
            callback();
        }
    });
}

function updateTimer() {
    if (!matchRunning && !matchStartTime) {
        $('.timer-count').text(MATCH_LENGTH);
        $('.timer-fill').css('width', 0);
        $('.timer-fill').removeClass('red yellow');
    }

    if (!matchRunning) {
        return;
    }

    teleopStartTime = matchStartTime + AUTO_LENGTH + PAUSE_LENGTH;

    var secondsFromStart = Math.floor((Date.now() - parseInt(matchStartTime)) / 1000);
    var secondsFromTeleop = Math.floor((Date.now() - parseInt(teleopStartTime)) / 1000);

    var output;
    if (isNaN(secondsFromTeleop)) {
        if (secondsFromStart >= AUTO_LENGTH) {
            output = MATCH_LENGTH - AUTO_LENGTH;
        } else {
            output = MATCH_LENGTH - secondsFromStart;
        }
    }
    else {
        output = MATCH_LENGTH - AUTO_LENGTH - secondsFromTeleop;
    }

    if (output < 0) {
        output = 0;
    }

    $('.timer-count').text(output);

    timerWidth = ((MATCH_LENGTH - output) / MATCH_LENGTH) * 100;
    $('.timer-fill').css('width', timerWidth + "%");
    if (output === 0) {
        $('.timer-fill').addClass('red');
    } else if (output <= WARNING_LENGTH) {
        $('.timer-fill').addClass('yellow');
    } else {
        $('.timer-fill').removeClass('red yellow');
    }
}

$(document).ready(function() {
    getConfig(function() {
        setLeftRightColors(config['is_red_left']);
        setEventName(config['event_name']);
    });
    setInterval(updateTimer, 50);
});
