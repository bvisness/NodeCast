var active_keys;

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

function editScoreInput(element) {
    $(element).attr('data-prev-value', $(element).val());
    $(element).val('').focus();
}

function validateScoreInput(element) {
    var val = $(element).val();
    if (!!val && !isNaN(parseInt(val, 10))) {
        console.log('Good job!!!');
        sendMatchState();
    } else {
        $(element).val($(element).attr('data-prev-value'));
    }
}

function sendMatchState() {
    var msgObject = {
        'type': 'match_update',
        'match_state': {
            'info': {
                'match_key': 'qmXX',
                'teams': {
                    'red': [1234, 2345, 3456],
                    'blue': [4567, 5678, 6789]
                }
            },
            'period': 'inactive',
            'start_time': 0,
            'teleop_time': 0,
            'scores': {
                'red': $('.score.red').val(),
                'blue': $('.score.blue').val()
            },
            'defense_strengths': {
                'red': [2, 2, 1, 1, 0],
                'blue': [2, 2, 1, 1, 0]
            },
            'tower_strengths': {
                'red': 7,
                'blue': 4
            }
        }
    };
    sendWebSocketMessage(JSON.stringify(msgObject));
}

$(document).ready(function() {
    getConfig(function() {
        setLeftRightColors(config['is_red_left'], config['flip_score_colors']);
    });

    $('.score').on('mousedown', function(e) {
        e.preventDefault();
        editScoreInput(this);
    }).on('keydown', function(e) {
        if (e.keyCode == 13) { // Enter
            $(this).blur();
        }
    }).on('blur', function(e) {
        validateScoreInput(this);
    });

    sendWebSocketMessage('{"message_type": "register", "client_type": "control panel"}');    
});
