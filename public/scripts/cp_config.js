function populate() {
    function success(input) {
        $('.result').text('Successfully updated ' + $(input).attr('data-json-key') + ' to ' + inputVal(input) + '.');
    }
    function error(input) {
        $('.result').text('Error updating ' + $(input).attr('data-json-key') + '. See console for details.');
    }
    function doPatch(input) {
        patchConfig(input, function() {
            success(input);
        }, function() {
            error(input);
        });
    }

    for (var key in config) {
        var field = blueprint.instantiate('field');
        $(field).find('.title').text(key);
        $(field).find('input').val(config[key]).attr('data-json-key', key);

        switch (typeof config[key]) {
        case 'number':
            $(field).find('input').attr('type', 'number');
            break;
        case 'boolean':
            $(field).find('input').attr('type', 'checkbox').prop('checked', config[key]);
            $(field).find('input').on('change', function() {
                doPatch(this);
            });
            break;
        }

        $('.fields').append(field);
    }

    $('.field input').on('blur', function() {
        doPatch(this);
    }).on('keydown', function(e) {
        if (e.keyCode == 13) { // Enter
            $(this).blur();
        }
    });
}

function inputVal(input) {
    switch ($(input).attr('type')) {
    case 'checkbox':
        return $(input).prop('checked');
    case 'number':
        return parseInt($(input).val(), 10);
    default:
        return $(input).val();
    }
}

function patchConfig(input, callbackSuccess = function(){}, callbackError = function(){}) {
    var key = $(input).attr('data-json-key');

    var dataObj = {};
    dataObj[key] = inputVal(input);
    var data = JSON.stringify(dataObj);

    $.ajax({
        method: 'PATCH',
        url: '/api/config',
        contentType: 'application/json',
        data: data,
        success: function(responseData) {
            console.log('Successfully PATCHed using following data:');
            console.log(data);
            callbackSuccess();
        },
        error: function() {
            console.log('Error PATCHing using following data:');
            console.log(data);
            callbackError();
        }
    });
}

$(document).ready(function() {
    getConfig(populate);
});
