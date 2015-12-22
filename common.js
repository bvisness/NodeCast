function isRealObject(object) {
    return (typeof object === "object" && object !== null && !Array.isArray(object));
}
module.exports.isRealObject = isRealObject;

function cloneObject(object) {
    return JSON.parse(JSON.stringify(object));
}
module.exports.cloneObject = cloneObject;
