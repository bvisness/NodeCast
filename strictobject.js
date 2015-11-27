var BUILTIN_TYPES = [
    "boolean",
    "number",
    "string",
    "function",
    "object", // This will refer to ACTUAL objects
    "array"
];

var types = {};

//
// Private functions
//
function isRealObject(object) {
    return (typeof object === "object" && object !== null && !Array.isArray(object));
}

// 
// Public functions
//
function getTypes() {
    return types;
}
module.exports.getTypes = getTypes;

function registerType(name, fields) {
    function validateFields(fields) {
        var isEmpty = true;
        for (var fieldName in fields) {
            isEmpty = false;
            if (typeof fields[fieldName] === "string") {
                var isBuiltinType = BUILTIN_TYPES.indexOf(fields[fieldName]) !== -1;
                var isRegisteredType = types.hasOwnProperty(fields[fieldName]);
                if (!isBuiltinType && !isRegisteredType) {
                    throw "Type " + fields[fieldName] + " not recognized.";
                }
            } else if (isRealObject(fields[fieldName])) {
                // Recursively check this field's fields
                validateFields(fields[fieldName]);
            } else {
                throw "Field type for " + fieldName + " must be a string or compatible object.";
            }
        }
        if (isEmpty) {
            throw "Fields cannot be an empty object.";
        }
    }

    if (typeof name !== "string") {
        name = name + "";
    }
    if (BUILTIN_TYPES.indexOf(name) !== -1) {
        throw name + " is already a built-in type.";
    }
    validateFields(fields);

    types[name] = fields;
}
module.exports.registerType = registerType;

function isValidInstance(object, type, exceptions) {
    if (!isRealObject(object)) {
        throw "isValidInstance can only be used to validate objects";
    }
    
    if (typeof exceptions !== "boolean") {
        exceptions = false; // This will also handle undefined
    }

    function failWithMessage(message) {
        if (exceptions) {
            throw message;
        }
        return false;
    }

    if (typeof type === "string") {
        if (!types.hasOwnProperty(type)) {
            throw "Type " + type + " was not registered.";
        }
        type = types[type];
    }

    for (var fieldName in type) {
        if (!object.hasOwnProperty(fieldName)) {
            return failWithMessage("Object did not have field " + fieldName);
        }

        var fieldType = type[fieldName];

        if (typeof fieldType === "string") {
            if (types.hasOwnProperty(fieldType)) {
                if (!isValidInstance(object[fieldName], fieldType, exceptions)) {
                    return false;
                }
            } else if (fieldType === "object") {
                if (object[fieldName] === null) {
                    return failWithMessage("Value for key " + fieldName + " expected to be object, was null");
                }
                if (Array.isArray(object[fieldName])) {
                    return failWithMessage("Value for key " + fieldName + " expected to be object, was array");
                }
            } else if (fieldType === "array") {
                if (!Array.isArray(object[fieldName])) {
                    return failWithMessage("Value for key " + fieldName + " expected to be array, was " + object[fieldName]);
                }
            } else {
                if (typeof object[fieldName] !== fieldType) {
                    return failWithMessage("Value for key " + fieldName + " expected to be " + fieldType + ", was " + object[fieldName]);
                } 
            }
        } else if (typeof fieldType === "object") {
            if (!isValidInstance(object[fieldName], type[fieldName], exceptions)) {
                return false;
            }
        }
    }
    for (var fieldName in object) {
        if (!type.hasOwnProperty(fieldName)) {
            return failWithMessage("Object had field " + fieldName + " which was not in type");
        }
    }
    return true;
}
module.exports.isValidInstance = isValidInstance;
