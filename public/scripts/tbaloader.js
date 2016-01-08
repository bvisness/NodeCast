var EVENT_KEY;
var TBA_HEADERS = {
    "X-TBA-App-Id": "frc2175:NodeCast:v0.1"
};

function validateMatch() {
    var re = /^((qf|sf|f)\d+m\d+|qm\d+)$/;
    var matchKey = $('input.match-key').val();
    if (re.test(matchKey)) {
        $('.btn.go').addClass('active');
    } else {
        $('.btn.go').removeClass('active');
    }
}

function fillMatchElement(matchElement, matchObject) {
    $(matchElement).attr('data-match-json', JSON.stringify(matchObject));
    
    var matchKeyOnly = matchObject.key.substring(matchObject.key.indexOf("_") + 1);
    $(matchElement).find(".match-key").html(matchKeyOnly);
    $(matchElement).find(".score.red").html(matchObject.alliances.red.score);
    $(matchElement).find(".score.blue").html(matchObject.alliances.blue.score);
}

function showMatches(loadedMatches) {
    function showMatch(loadedMatch) {
        return function() {
            var matchDiff = blueprint.instantiate("match-diff");
            var originalMatch = $(matchDiff).find(".match.original");
            var newMatch = $(matchDiff).find(".match.new");

            // Get local match
            $.ajax("/api/match/" + loadedMatch.key, { // DOUBLE-CHECK THIS KEY
                method: "GET",
                success: function(data) {
                    fillMatchElement(originalMatch, data);
                    $(originalMatch).addClass('selected');
                    $(matchDiff).find('.option.keep').addClass('active');
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log("Error: " + errorThrown);
                    $(originalMatch).hide();
                    $(newMatch).addClass('selected');
                    $(matchDiff).find('.option.update').addClass('active');
                },
                complete: function() {
                    fillMatchElement(newMatch, loadedMatch);

                    $(".match-diff-list").append(matchDiff);
                    setupEventHandlers(matchDiff);
                    updateHeaderOptions();
                }
            });
        };
    }

    for (var i = 0; i < loadedMatches.length; i++) {
        showMatch(loadedMatches[i])();
    }
}

function loadMatch() {
    var key = $('input.match-key').val();
    console.log("Loading match " + key);

    $.ajax("http://www.thebluealliance.com/api/v2/match/" + EVENT_KEY + "_" + key, {
        method: "GET",
        headers: TBA_HEADERS,
        success: function(data) {
            showMatches([data]);
        }
    });
}

function loadMatches() {
    console.log("Loading all matches for event " + EVENT_KEY);

    $.ajax("http://www.thebluealliance.com/api/v2/event/" + EVENT_KEY + "/matches", {
        method: "GET",
        headers: TBA_HEADERS,
        success: function(data) {
            showMatches(data);
        }
    });
}

function updateHeaderOptions() {
    var numKeepActive = $('.match-diff .option.keep.active').length;
    var numOrigActive = $('.match-diff .option.update.active').length;

    if (numKeepActive === 0) {
        $('.header .option.keep').removeClass('active');
        $('.header .option.update').addClass('active');
    } else if (numOrigActive === 0) {
        $('.header .option.keep').addClass('active');
        $('.header .option.update').removeClass('active');
    } else {
        $('.header .option.keep').removeClass('active');
        $('.header .option.update').removeClass('active');
    }
}

function selectOriginal(matchDiff) {
    $(matchDiff).find('.option.keep').addClass('active');
    $(matchDiff).find('.option.update').removeClass('active');
    $(matchDiff).find('.match.original').addClass('selected');
    $(matchDiff).find('.match.new').removeClass('selected');
}

function selectNew(matchDiff) {
    $(matchDiff).find('.option.keep').removeClass('active');
    $(matchDiff).find('.option.update').addClass('active');
    $(matchDiff).find('.match.original').removeClass('selected');
    $(matchDiff).find('.match.new').addClass('selected');
}

function setupEventHandlers(matchDiff) {
    $(matchDiff).find('.option.keep').on('click', function() {
        selectOriginal(matchDiff);
        updateHeaderOptions();
    });
    $(matchDiff).find('.option.update').on('click', function() {
        selectNew(matchDiff);
        updateHeaderOptions();
    });
}

function getMatchObject(matchElement) {
    var matchObjectFull = JSON.parse($(matchElement).attr('data-match-json'));
    return {
        "key": matchObjectFull.key,
        "time": matchObjectFull.time,
        "alliances": {
            "red": {
                "score": matchObjectFull.alliances.red.score,
                "teams": matchObjectFull.alliances.red.teams
            },
            "blue": {
                "score": matchObjectFull.alliances.blue.score,
                "teams": matchObjectFull.alliances.blue.teams
            }
        }
    };
}

function finishLoading() {
    $('.match-diffs .match-diff').each(function(i, matchDiff) {
        // We do nothing if we decide to keep what we have
        
        if ($(matchDiff).find('.option.update').hasClass('active')) {
            var newMatchElement = $(matchDiff).find('.match.new');
            var obj = getMatchObject(newMatchElement);

            $.ajax('/api/match/' + obj.key, {
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(obj),
                success: function() {
                    console.log("Successfully saved match " + obj.key);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log("Error saving match " + obj.key + "! " + errorThrown);
                }
            });
        }
    });
    showConfirmation();
}

function showConfirmation() {
    $('.match-diffs').hide();
}

$(document).ready(function() {
    function switchToDiffs() {
        $('.mode-select').hide();
        $('.match-diffs').show();
    }

    $('input.match-key').on('input', function() {
        validateMatch();
    });

    $('.match-key-info-link a').on('click', function() {
        $('.match-key-info').show();
        $('.match-key-info-link').hide();
    });
    $('.mode.all a').on('click', function() {
        loadMatches();
        switchToDiffs();
    });
    $('input.match-key').keypress(function(e) {
        if(e.which == 13) {
            if (! $('.btn.go').hasClass('active')) {
                return;
            }
            loadMatch();
            switchToDiffs();
        }
    });
    $('.btn.go').on('click', function() {
        if (! $('.btn.go').hasClass('active')) {
            return;
        }
        loadMatch();
        switchToDiffs();
    });

    $('.header .option.keep').on('click', function() {
        $(this).addClass('active');
        $(this).siblings('.option').removeClass('active');
        $('.match-diff-list .match-diff').each(function(i, e) {
            selectOriginal(e);
        });
    });
    $('.header .option.update').on('click', function() {
        $(this).addClass('active');
        $(this).siblings('.option').removeClass('active');
        $('.match-diff-list .match-diff').each(function(i, e) {
            selectNew(e);
        });
    });
    $('.finish').on('click', function() {
        finishLoading();
    });
});

$.ajax("/api/config", {
    method: "GET",
    success: function(data) {
        EVENT_KEY = data.event_key;
    }
});
