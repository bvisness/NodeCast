var KEY_EDIT_RED_SCORE = 84; // t
var KEY_EDIT_BLUE_SCORE = 89; // y
var KEYS_RED_DEFENSES_DOWN = [90, 88, 67, 86, 66]; // z, x, c, v, b
var KEYS_RED_DEFENSES_UP = [65, 83, 68, 70, 71]; // a, s, d, f, g
var KEYS_BLUE_DEFENSES_DOWN = [78, 77, 188, 190, 191]; // n, m, ,, ., /
var KEYS_BLUE_DEFENSES_UP = [74, 75, 76, 186, 222]; // j, k, l, ;, '

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

function defenseStrengthDown(defense) {
    var strength = parseInt($(defense).attr('data-strength'), 10);
    strength = Math.max(0, strength - 1);
    $(defense).attr('data-strength', strength);
    sendMatchState();
}

function defenseStrengthUp(defense) {
    var strength = parseInt($(defense).attr('data-strength'), 10);
    strength = Math.min(2, strength + 1);
    $(defense).attr('data-strength', strength);
    sendMatchState();
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

function addKeyHelpers() {
    for (var i = 0; i < 5; i++) {
        var redDefenseDownBtn = $('.defenses.red .defense-down-btn').eq(i);
        var redDefenseUpBtn = $('.defenses.red .defense-up-btn').eq(i);
        var blueDefenseDownBtn = $('.defenses.blue .defense-down-btn').eq(i);
        var blueDefenseUpBtn = $('.defenses.blue .defense-up-btn').eq(i);

        $(redDefenseDownBtn).attr('data-content', keyboardMap[KEYS_RED_DEFENSES_DOWN[i]]);
        $(redDefenseUpBtn).attr('data-content', keyboardMap[KEYS_RED_DEFENSES_UP[i]]);
        $(blueDefenseDownBtn).attr('data-content', keyboardMap[KEYS_BLUE_DEFENSES_DOWN[i]]);
        $(blueDefenseUpBtn).attr('data-content', keyboardMap[KEYS_BLUE_DEFENSES_UP[i]]);
    }
}

$(document).ready(function() {
    addKeyHelpers();

    getConfig(function() {
        // Config code here
    });

    // Configure editing of inputs in general
    $('input').on('mousedown', function(e) {
        e.preventDefault();
        editInput(this);
    }).on('keydown', function(e) {
        if (e.keyCode == 13) { // Enter
            $(this).blur();
        }
    });

    // Configure validation of numeric inputs
    $('.score, .team').on('blur', function(e) {
        validateNumericInput(this);
    });

    // Configure defense up/down buttons
    $('.defense-down-btn').on('click', function(e) {
        var defense = $(this).siblings('.defense');
        defenseStrengthDown(defense);
    });
    $('.defense-up-btn').on('click', function(e) {
        var defense = $(this).siblings('.defense');
        defenseStrengthUp(defense);
    });

    // Configure keypresses
    $(document).on('keydown', function(e) {
        if ($(':focus').length > 0) {
            return;
        }

        // Make it easy to refresh the page
        if (e.keyCode == 17 || e.keyCode == 91 || e.keyCode == 82) {
            return;
        }

        // Configure "easy" keypresses
        e.preventDefault();
        switch (e.keyCode) {
        case KEY_EDIT_RED_SCORE:
            editInput($('.score.red'));
            break;
        case KEY_EDIT_BLUE_SCORE:
            editInput($('.score.blue'));
            break;
        }

        // Configure defense up/down keypresses
        var keyIndex;
        if ((keyIndex = KEYS_RED_DEFENSES_DOWN.indexOf(e.keyCode)) !== -1) {
            var defense = $('.defenses.red .defense').eq(keyIndex);
            defenseStrengthDown(defense);
        } else if ((keyIndex = KEYS_RED_DEFENSES_UP.indexOf(e.keyCode)) !== -1) {
            var defense = $('.defenses.red .defense').eq(keyIndex);
            defenseStrengthUp(defense);
        } else if ((keyIndex = KEYS_BLUE_DEFENSES_DOWN.indexOf(e.keyCode)) !== -1) {
            var defense = $('.defenses.blue .defense').eq(keyIndex);
            defenseStrengthDown(defense);
        } else if ((keyIndex = KEYS_BLUE_DEFENSES_UP.indexOf(e.keyCode)) !== -1) {
            var defense = $('.defenses.blue .defense').eq(keyIndex);
            defenseStrengthUp(defense);
        }
    });

    sendWebSocketMessage('{"message_type": "register", "client_type": "control panel"}');    
});
