var blueprint = {};
blueprint.blueprints = {};

blueprint.instantiate = function(klass) {
    return $(blueprint.blueprints[klass]);
}

$(document).ready(function() {
    $('.blueprint').each(function(i, e) {
        $(e).removeClass('blueprint');
        var klass = $(e).attr('class');
        blueprint.blueprints[klass] = $(e)[0].outerHTML;
        $(e).remove();
    });
});
