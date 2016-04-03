var config = {};

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