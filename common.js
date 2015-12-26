function isRealObject(object) {
    return (typeof object === "object" && object !== null && !Array.isArray(object));
}
module.exports.isRealObject = isRealObject;

function cloneObject(object) {
    return JSON.parse(JSON.stringify(object));
}
module.exports.cloneObject = cloneObject;

function parseStack(stackText) {
    var stack = [];
    var reStackItem = /    at (.*?)(:(\d+):\d+)?( \((.*?)(:(\d+):\d+)?\))?(\n|$)/g;
    while ((matches = reStackItem.exec(stackText)) !== null) {
        var stackItem;
        if (matches[3] === undefined) {
            // Function is named
            stackItem = {
                "function_name": matches[1],
                "location": matches[5],
                "line": matches[7]
            };
        } else {
            // No function is named
            stackItem = {
                "location": matches[1],
                "line": matches[3]
            };
        }

        stack.push(stackItem);
    }

    return stack;
}
module.exports.parseStack = parseStack;

function trimString(string, characters) {
    if (!characters || typeof characters !== "string") {
        return string.trim();
    }

    var startIndex, endIndex;
    var ch;

    for (var i = 0; i < string.length; i++) {
        startIndex = i;
        ch = string.charAt(i);
        if (!/\s/.test(ch) && characters.indexOf(ch) === -1) {
            // Not a character we should trim
            break;
        }
    }

    for (var j = string.length - 1; j >= 0; j--) {
        endIndex = j;
        ch = string.charAt(j);
        if (!/\s/.test(ch) && characters.indexOf(ch) === -1) {
            // Not a character we should trim
            break;
        }
    }

    return string.substring(startIndex, endIndex + 1);
}
module.exports.trimString = trimString;
