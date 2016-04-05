var KEY_EDIT_RED_SCORE = 82; // r
var KEY_EDIT_BLUE_SCORE = 66; // b

var active_keys;

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

function editInput(element) {
    if ($(element).is(':focus')) {
        return;
    }
    
    $(element).attr('data-prev-value', $(element).val());
    $(element).val('').focus();
}

function validateNumericInput(element) {
    var val = $(element).val();
    if (val && !isNaN(parseInt(val, 10))) {
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
                    'red': [
                        $('.teams.red .team').eq(0).val(),
                        $('.teams.red .team').eq(1).val(),
                        $('.teams.red .team').eq(2).val()
                    ],
                    'blue': [
                        $('.teams.blue .team').eq(0).val(),
                        $('.teams.blue .team').eq(1).val(),
                        $('.teams.blue .team').eq(2).val()
                    ]
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

    $('input').on('mousedown', function(e) {
        e.preventDefault();
        editInput(this);
    }).on('keydown', function(e) {
        if (e.keyCode == 13) { // Enter
            $(this).blur();
        }
    });

    $('.score, .team').on('blur', function(e) {
        validateNumericInput(this);
    });

    $(document).on('keydown', function(e) {
        if ($(':focus').length > 0) {
            return;
        }

        e.preventDefault();
        switch (e.keyCode) {
        case KEY_EDIT_RED_SCORE:
            editInput($('.score.red'));
            break;
        case KEY_EDIT_BLUE_SCORE:
            editInput($('.score.blue'));
            break;
        }
    });

    sendWebSocketMessage('{"message_type": "register", "client_type": "control panel"}');    
});
