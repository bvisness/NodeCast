var assert = require('chai').assert;
var strictobject = require('../strictobject.js');
var frcdb = require('../frcdb.js');
var jsondb = require('../jsondb.js');
var common = require('../common.js');
var fs = require('fs');

describe("strictobject", function() {
    describe("registerType(name, fields)", function() {
        before(function() {
            strictobject.registerType("testType", {
                "foo": "string",
                "bar": {
                    "ding": "number",
                    "dong": "boolean"
                }
            });
        });

        it("should not accept empty object for fields", function() {
            assert.throws(function() {
                strictobject.registerType("foo", {});
            });
            assert.throws(function() {
                strictobject.registerType("foo", {"bar": {}});
            });
        });
        it("should only accept strings for type descriptions", function() {
            assert.throws(function() {
                strictobject.registerType("foo", {"bar": undefined});
            });
            assert.throws(function() {
                strictobject.registerType("foo", {"bar": null});
            });
            assert.throws(function() {
                strictobject.registerType("foo", {"bar": true});
            });
            assert.throws(function() {
                strictobject.registerType("foo", {"bar": 3});
            });
            assert.throws(function() {
                strictobject.registerType("foo", {"bar": function() {}});
            });
            assert.throws(function() {
                strictobject.registerType("foo", {"bar": []});
            });
        });
        it("should not allow redefining built-in types", function() {
            assert.throws(function() {
                strictobject.registerType("boolean", {"foo": "string"});
            });
            assert.throws(function() {
                strictobject.registerType("number", {"foo": "string"});
            });
            assert.throws(function() {
                strictobject.registerType("string", {"foo": "string"});
            });
            assert.throws(function() {
                strictobject.registerType("function", {"foo": "string"});
            });
            assert.throws(function() {
                strictobject.registerType("object", {"foo": "string"});
            });
            assert.throws(function() {
                strictobject.registerType("array", {"foo": "string"});
            });
        });
        it("should reject unrecognized types", function() {
            assert.throws(function() {
                strictobject.registerType("foo", {"bar": "notARealType"});
            });
        });
        it("should support already registered types for field types", function() {
            assert.doesNotThrow(function() {
                strictobject.registerType("preRegisterTestType", {"bar": "testType"});
            });
        });
        it("should support redefining existing custom types", function() {
            assert.doesNotThrow(function() {
                strictobject.registerType("redefineCustomTypeType", {"bar": "number"});
                strictobject.registerType("redefineCustomTypeType", {"baz": "boolean"});
            });
        });
    });
    
    describe("isValidInstance(object, type)", function() {
        before(function() {
            strictobject.registerType("testType", {
                "foo": "string",
                "bar": {
                    "ding": "boolean",
                    "dong": "number",
                    "extra": {
                        "foo": "function",
                        "bar": "object",
                        "baz": "array"
                    }
                }
            });
        });

        it("should fail for validating non-objects", function() {
            assert.throws(function() {
                strictobject.isValidInstance(3.14159, "testType");
            }, "isValidInstance can only be used to validate objects");
            assert.throws(function() {
                strictobject.isValidInstance([1, 2, 3], "testType");
            }, "isValidInstance can only be used to validate objects");
        });
        it("should fail for unregistered types", function() {
            assert.throws(function() {
                strictobject.isValidInstance({"foo": "bar"}, "unregisteredType");
            });
        });
        it("should recognize all well-behaved types (boolean, number, string, function, array)", function() {
            strictobject.registerType("primitiveTestType", {"bar": "boolean"});
            assert.isTrue(strictobject.isValidInstance({"bar": true}, "primitiveTestType", true));

            strictobject.registerType("primitiveTestType", {"bar": "number"});
            assert.isTrue(strictobject.isValidInstance({"bar": 3}, "primitiveTestType", true));

            strictobject.registerType("primitiveTestType", {"bar": "string"});
            assert.isTrue(strictobject.isValidInstance({"bar": "hello world"}, "primitiveTestType", true));

            strictobject.registerType("primitiveTestType", {"bar": "function"});
            assert.isTrue(strictobject.isValidInstance({"bar": function() {}}, "primitiveTestType", true));

            strictobject.registerType("primitiveTestType", {"bar": "array"});
            assert.isTrue(strictobject.isValidInstance({"bar": [1, 2, 3]}, "primitiveTestType", true));
        });
        it("should match types with nested structures", function() {
            assert.isTrue(strictobject.isValidInstance({
                "foo": "hello",
                "bar": {
                    "ding": true,
                    "dong": 3,
                    "extra": {
                        "foo": function() {},
                        "bar": {},
                        "baz": [1, 2, 3]
                    }
                }
            }, "testType"));
            assert.isFalse(strictobject.isValidInstance({
                "foo": "hello",
                "bar": {
                    "ding": "some string",
                    "dong": "another string",
                    "extra": {
                        "foo": "a string",
                        "bar": "a string",
                        "baz": "a string"
                    }
                }
            }, "testType"));
        });
        it("should allow any object for type \"object\"", function() {
            strictobject.registerType("objectTestType", {"bar": "object"});

            assert.isTrue(strictobject.isValidInstance({"bar": {}}, "objectTestType", true));
            assert.isTrue(strictobject.isValidInstance({"bar": {"ding": "dong"}}, "objectTestType", true));
            assert.isTrue(strictobject.isValidInstance({"bar": {"ding": {"field": "whatever"}}}, "objectTestType", true));
        });
        it("should not allow null for type \"object\"", function() {
            strictobject.registerType("objectTestType", {"bar": "object"});
            var testObj = {"bar": null};

            assert.throws(function() {
                strictobject.isValidInstance({"bar": null}, "objectTestType", true);
            }, "expected to be object, was null");
            assert.isFalse(strictobject.isValidInstance({"bar": null}, "objectTestType"));
        });
        it("should not allow arrays for type \"object\"", function() {
            strictobject.registerType("arrayForObjectType", {"bar": "object"});
            var testObj = {"bar": [1, 2, 3]};

            assert.throws(function() {
                strictobject.isValidInstance(testObj, "arrayForObjectType", true);
            }, "expected to be object, was array");
            assert.isFalse(strictobject.isValidInstance(testObj, "arrayForObjectType"));
        });
        it("should fail when object has missing fields", function() {
            assert.throws(function() {
                strictobject.isValidInstance({"foo": "hello"}, "testType", true);
            }, "Object did not have field");
            assert.throws(function() {
                strictobject.isValidInstance({
                    "foo": "hello",
                    "bar": {
                        "ding": true
                    }
                }, "testType", true);
            }, "Object did not have field");
        });
        it("should fail when object has extra fields", function() {
            assert.throws(function() {
                var testObj = {
                    "foo": "hello",
                    "bar": {
                        "ding": true,
                        "dong": 3,
                        "extra": {
                            "foo": function() {},
                            "bar": {},
                            "baz": [1, 2, 3]
                        }
                    },
                    "extra": "I shouldn't be here"
                };
                strictobject.isValidInstance(testObj, "testType", true);
            }, "which was not in type");
            assert.throws(function() {
                var testObj = {
                    "foo": "hello",
                    "bar": {
                        "ding": true,
                        "dong": 3,
                        "extra": {
                            "foo": function() {},
                            "bar": {},
                            "baz": [1, 2, 3]
                        },
                        "extra_again": "I shouldn't be here"
                    }
                };
                strictobject.isValidInstance(testObj, "testType", true);
            }, "which was not in type");
        });
    });
});

describe("jsondb", function() {
    describe("registerType", function() {
        beforeEach(function() {
            jsondb.removeAll("jsondbType");
        });

        it("should accept valid types", function() {
            var structure = {
                "foo": "string",
                "bar": {
                    "daft": "number",
                    "punk": "boolean"
                }
            };
            assert.doesNotThrow(function() {
                jsondb.registerType("jsondbType", structure, "foo");
            });
        });
        it("should reject duplicate types", function() {
            var structure = {"foo": "string"};
            assert.throws(function() {
                jsondb.registerType("jsondbType", structure, "foo");
                jsondb.registerType("jsondbType", structure, "foo");
            }, "was already registered");
        });
        it("should require a primary key to be specified", function() {
            var structure = {"foo": "string"};
            assert.throws(function() {
                jsondb.registerType("jsondbType", structure);
            }, "You must provide a primary key");
        });
        it("should require the structure to have the primary key as a property", function() {
            var structure = {"foo": "string"};
            assert.throws(function() {
                jsondb.registerType("jsondbType", structure, "bar");
            }, "does not have primary key");
        });

        after(function() {
            jsondb.removeAll("jsondbType");
        });
    });
    
    describe("get", function() {
        var original = {
            "foo": "key1",
            "bar": {
                "daft": 3210,
                "punk": true
            }
        };
        
        before(function() {
            var structure = {
                "foo": "string",
                "bar": {
                    "daft": "number",
                    "punk": "boolean"
                }
            };
            jsondb.registerType("jsondbType", structure, "foo");
            jsondb.save("jsondbType", original);
        });

        it("should return the correct data", function() {
            var retrieved = jsondb.get("jsondbType", "key1");
            assert.equal(JSON.stringify(original), JSON.stringify(retrieved));
        });
        it("should return a clone of the original object", function() {
            var retrieved = jsondb.get("jsondbType", "key1");
            retrieved["foo"] = "keyDifferent";
            assert.notEqual(original, retrieved);
            assert.notEqual(JSON.stringify(original), JSON.stringify(retrieved));
        });
        it("should throw an error for nonexistent types", function() {
            assert.throws(function() {
                jsondb.get("not a real type", "key1");
            }, "Unrecognized type");
        });
        it("should return undefined for nonexistent objects", function() {
            var retrieved = jsondb.get("jsondbType", "not an actual key");
            assert.isUndefined(retrieved);
        });

        after(function() {
            jsondb.removeAll("jsondbType");
        });
    });

    describe("getAll", function() {
        before(function() {
            var structure = {"foo": "string"};
            jsondb.registerType("jsondbType", structure, "foo");
            jsondb.save("jsondbType", {"foo": "key1"});
            jsondb.save("jsondbType", {"foo": "key2"});
        });

        it("should return an object, not an array", function() {
            var retrieved = jsondb.getAll("jsondbType");
            assert.isTrue(common.isRealObject(retrieved));
        });
        it("should have all data that has been saved", function() {
            var retrieved = jsondb.getAll("jsondbType");
            assert.isDefined(retrieved["key1"]);
            assert.isDefined(retrieved["key2"]);
        });
        it("should throw an error for nonexistent types", function() {
            assert.throws(function() {
                jsondb.getAll("not a real type");
            }, "Unrecognized type");
        });
        it("should return independent instances of the data", function() {
            var retrieved1 = jsondb.getAll("jsondbType");
            var retrieved2 = jsondb.getAll("jsondbType");
            retrieved1["newkey"] = "wow";
            assert.notEqual(retrieved1, retrieved2);
            assert.notEqual(JSON.stringify(retrieved1), JSON.stringify(retrieved2));
        });

        after(function() {
            jsondb.removeAll("jsondbType");
        });
    });

    describe("save", function() {
        beforeEach(function() {
            jsondb.registerType("jsondbType", {"foo": "string"}, "foo");
        });

        it("should save objects", function() {
            var obj = {"foo": "hello"};
            jsondb.save("jsondbType", obj);
            var retrieved = jsondb.get("jsondbType", "hello");
            assert.equal(JSON.stringify(obj), JSON.stringify(retrieved));
        });
        it("should reject objects whose structure does not match", function() {
            var obj = {"foo": 3};
            assert.isFalse(jsondb.save("jsondbType", obj));
            assert.throws(function() {
                jsondb.save("jsondbType", obj, true);
            }, "Object was not a valid instance");
        });
        it("should create a new file if none exists", function() {
            jsondb.save("jsondbType", {"foo": "hello"});
            var result = false;
            try {
                var stats = fs.statSync('jsondb_data/jsondbType.json');
                if (stats.isFile()) {
                    result = true;
                }
            }
            catch (e) {
                result = e;
            }
            assert.isTrue(result);
        });

        afterEach(function() {
            jsondb.removeAll("jsondbType");
        });
    });

    describe("remove", function() {
        beforeEach(function() {
            jsondb.registerType("jsondbType", {"foo": "string"}, "foo");
            jsondb.save("jsondbType", {"foo": "key1"});
            jsondb.save("jsondbType", {"foo": "key2"});
        });

        it("should remove items", function() {
            assert.isDefined(jsondb.get("jsondbType", "key1"));
            jsondb.remove("jsondbType", "key1");
            assert.isUndefined(jsondb.get("jsondbType", "key1"));
        });
        it("should fail if the key is not present", function() {
            assert.isFalse(jsondb.remove("jsondbType", "key3"));
            assert.throws(function() {
                jsondb.remove("jsondbType", "key3", true);
            }, "not found");
        });

        afterEach(function() {
            jsondb.removeAll("jsondbType");
        });
    });

    describe("removeAll", function() {
        beforeEach(function() {
            jsondb.registerType("jsondbType", {"foo": "string"}, "foo");
            jsondb.save("jsondbType", {"foo": "key1"});
            jsondb.save("jsondbType", {"foo": "key2"});
        });

        it("should unregister the type", function() {
            jsondb.removeAll("jsondbType");
            assert.throws(function() {
                jsondb.get("jsondbType", "key1");
            }, "Unrecognized type");
        });
        it("should delete the file for that type", function() {
            jsondb.removeAll("jsondbType");
            var result = false;
            try {
                var stats = fs.statSync('jsondb_data/jsondbType.json');
            }
            catch (e) {
                result = e;
                if (e.code === 'ENOENT') {
                    result = true;
                }
            }
            assert.isTrue(result);
        });
    });
});
