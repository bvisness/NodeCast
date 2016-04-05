var KEY_EDIT_RED_SCORE = 84; // t
var KEY_EDIT_BLUE_SCORE = 89; // y
var KEYS_RED_DEFENSES_DOWN = [90, 88, 67, 86, 66]; // z, x, c, v, b
var KEYS_RED_DEFENSES_UP = [65, 83, 68, 70, 71]; // a, s, d, f, g
var KEYS_BLUE_DEFENSES_DOWN = [78, 77, 188, 190, 191]; // n, m, ,, ., /
var KEYS_BLUE_DEFENSES_UP = [74, 75, 76, 186, 222]; // j, k, l, ;, '
var KEY_RED_CASTLE_DOWN = 81; // q
var KEY_RED_CASTLE_UP = 87; // w
var KEY_BLUE_CASTLE_DOWN = 79; // o
var KEY_BLUE_CASTLE_UP = 80; // p

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

function validateMatchKey(key) {
    var re = /^((qf|sf|f)\d+m\d+|qm\d+)$/;
    if (re.test(key)) {
        sendMatchState();
    } else {
        $('.match-key').val($('.match-key').attr('data-prev-value'));
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

function castleStrengthDown(castle) {
    var strength = parseInt($(castle).attr('data-strength'), 10);
    $(castle).attr('data-strength', strength - 1);
    $(castle).find('.castle-strength').text(strength - 1);
    sendMatchState();
}

function castleStrengthUp(castle) {
    var strength = parseInt($(castle).attr('data-strength'), 10);
    strength = Math.min(config['max_tower_strength'], strength + 1);
    $(castle).attr('data-strength', strength);
    $(castle).find('.castle-strength').text(strength);
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
                'match_key': $('.match-key').val(),
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
                'red': parseInt($('.castle.red').attr('data-strength'), 10),
                'blue': parseInt($('.castle.blue').attr('data-strength'), 10)
            }
        }
    };
    sendWebSocketMessage(JSON.stringify(msgObject));
}

function addKeyHelpers() {
    function setContentFromKeyCode(element, code) {
        $(element).attr('data-content', keyboardMap[code]);
    }

    for (var i = 0; i < 5; i++) {
        var redDefenseDownBtn = $('.defenses.red .defense-down-btn').eq(i);
        var redDefenseUpBtn = $('.defenses.red .defense-up-btn').eq(i);
        var blueDefenseDownBtn = $('.defenses.blue .defense-down-btn').eq(i);
        var blueDefenseUpBtn = $('.defenses.blue .defense-up-btn').eq(i);

        setContentFromKeyCode(redDefenseDownBtn, KEYS_RED_DEFENSES_DOWN[i]);
        setContentFromKeyCode(redDefenseUpBtn, KEYS_RED_DEFENSES_UP[i]);
        setContentFromKeyCode(blueDefenseDownBtn, KEYS_BLUE_DEFENSES_DOWN[i]);
        setContentFromKeyCode(blueDefenseUpBtn, KEYS_BLUE_DEFENSES_UP[i]);
    }

    setContentFromKeyCode($('.castle.red .castle-down-btn'), KEY_RED_CASTLE_DOWN);
    setContentFromKeyCode($('.castle.red .castle-up-btn'), KEY_RED_CASTLE_UP);
    setContentFromKeyCode($('.castle.blue .castle-down-btn'), KEY_BLUE_CASTLE_DOWN);
    setContentFromKeyCode($('.castle.blue .castle-up-btn'), KEY_BLUE_CASTLE_UP);
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

    // Configure castle up/down buttons
    $('.castle-down-btn').on('click', function(e) {
        var castle = $(this).parents('.castle');
        castleStrengthDown(castle);
    });
    $('.castle-up-btn').on('click', function(e) {
        var castle = $(this).parents('.castle');
        castleStrengthUp(castle);
    });

    // Configure match key input
    $('.match-key').on('blur', function(e) {
        validateMatchKey($(this).val());
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
        case KEY_RED_CASTLE_DOWN:
            castleStrengthDown($('.castle.red'));
            break;
        case KEY_RED_CASTLE_UP:
            castleStrengthUp($('.castle.red'));
            break;
        case KEY_BLUE_CASTLE_DOWN:
            castleStrengthDown($('.castle.blue'));
            break;
        case KEY_BLUE_CASTLE_UP:
            castleStrengthUp($('.castle.blue'));
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
