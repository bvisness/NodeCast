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

var config;
var matchState;

function setLeftRightColors(isRedLeft, flipScoreColors) {
    var leftColor = isRedLeft ? 'red' : 'blue';
    var rightColor = isRedLeft ? 'blue' : 'red';

    if (flipScoreColors) {
        $('.alliance-color.score.left').removeClass('alliance-color').addClass(rightColor);
        $('.alliance-color.score.right').removeClass('alliance-color').addClass(leftColor);
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
    // Quit early if no active match
    if (matchState['period'] == 'inactive') {
        $('.timer-count').text(AUTO_LENGTH);
        $('.timer-fill').css('width', 0);
        $('.timer-fill').removeClass('red yellow');
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

$(document).ready(function() {
    getConfig(function() {
        setLeftRightColors(config['is_red_left'], config['flip_score_colors']);
        setEventName(config['event_name']);
    });
    setInterval(updateTimer, 50);
});
