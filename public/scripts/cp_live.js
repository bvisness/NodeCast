var KEY_EDIT_RED_SCORE = 82; // r
var KEY_EDIT_BLUE_SCORE = 66; // b

var active_keys;

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
    var redDefenseStrengths = [];
    var blueDefenseStrengths = [];
    for (var i = 0; i < 5; i++) {
        var redStrength = parseInt($('.defenses.red .defense').eq(i).attr('data-strength'), 10);
        var blueStrength = parseInt($('.defenses.blue .defense').eq(i).attr('data-strength'), 10);
        redDefenseStrengths.push(redStrength);
        blueDefenseStrengths.push(blueStrength);
    }
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
                'red': redDefenseStrengths,
                'blue': blueDefenseStrengths
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
        // Config code here
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

    $('.defense-down-btn').on('click', function(e) {
        var defense = $(this).siblings('.defense');
        var strength = parseInt($(defense).attr('data-strength'), 10);
        strength = Math.max(0, strength - 1);
        $(defense).attr('data-strength', strength);
        sendMatchState();
    });
    $('.defense-up-btn').on('click', function(e) {
        var defense = $(this).siblings('.defense');
        var strength = parseInt($(defense).attr('data-strength'), 10);
        strength = Math.min(2, strength + 1);
        $(defense).attr('data-strength', strength);
        sendMatchState();
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
