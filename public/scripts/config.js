var config = {};

function initializeConfig(callback = function(){}) {
    $.ajax({
        method: 'PUT',
        url: '/api/config',
        contentType: 'application/json',
        data: JSON.stringify({
            'event_key': '2016mnmi2',
            'event_name': 'North Star Regional',
            'is_red_left': true,
            'flip_score_colors': true,
            'max_tower_strength': 8,
            'num_qualification_matches': 50
        }),
        success: function(data) {
            console.log('Initialized config');
            callback();
        }
    });
}

function getConfig(callback = function(){}) {
    $.ajax({
        method: 'GET',
        url: '/api/config',
        success: function(data) {
            config = data;
            if (!config) {
                initializeConfig(callback);
            } else {
                callback();
            }
        }
    });
}
