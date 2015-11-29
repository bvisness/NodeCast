var assert = require('chai').assert;
var strictobject = require('../strictobject.js');
var frcdb = require('../frcdb.js');

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

describe("frcdb", function() {
    describe("getTeam(team)", function() {
        before(function() {
            frcdb.saveTeam({
                "name": "The Fighting Calculators",
                "number": 2175
            });
        });

        it("should return undefined for unknown teams", function() {
            assert.isUndefined(frcdb.getTeam(9999));
        });
        it("should return undefined for degenerate input", function() {
            assert.isUndefined(frcdb.getTeam(false));
            assert.isUndefined(frcdb.getTeam([1, 2, 3]));
        });
        it("should return a valid team object for a known team", function() {
            var team = frcdb.getTeam(2175);
            assert.isOk(team);
            assert.isTrue(strictobject.isValidInstance(team, "team"));
        });

        after(function() {
            frcdb.deleteTeam(2175);
        });
    });

    describe("saveTeam(team)", function() {
        it("should work for valid teams", function() {
            var team = {
                "name": "The Fighting Calculators",
                "number": 2175
            };
            assert.isTrue(frcdb.saveTeam(team));
        });
        it("should fail for invalid teams (but not throw exception)", function() {
            var team = {
                "name": "The Invalid Calculators"
            };
            assert.isFalse(frcdb.saveTeam(team));
            assert.doesNotThrow(function() {
                frcdb.saveTeam(team);
            });
        });
    });

    describe("deleteTeam(teamNumber)", function() {
        before(function() {
            frcdb.saveTeam({
                "name": "The Fighting Calculators",
                "number": 2175
            });
        });

        it("should return false for unknown teams", function() {
            assert.isFalse(frcdb.deleteTeam(9999));
        });
        it("should return true for successful deletion", function() {
            assert.isTrue(frcdb.deleteTeam(2175));
            assert.isUndefined(frcdb.getTeam(2175));
        });

        after(function() {
            frcdb.deleteTeam(2175);
        });
    });

    describe("getMatch(matchKey)", function() {
        before(function() {
            frcdb.saveMatch({
                "key": "2015mnmi2_m1",
                "time": 12345678,
                "alliances": {
                    "red": {
                        "score": 30,
                        "teams": [
                            2175,
                            3130,
                            1986
                        ]
                    },
                    "blue": {
                        "score": 40,
                        "teams": [
                            111,
                            1114,
                            2056
                        ]
                    }
                }
            });
        });

        it("should return undefined for unknown matches", function() {
            assert.isUndefined(frcdb.getMatch("2015mnmi2_notamatch"));
        });
        it("should return undefined for degenerate input", function() {
            assert.isUndefined(frcdb.getMatch(false));
            assert.isUndefined(frcdb.getMatch([1, 2, 3]));
        });
        it("should return a valid match object for a known match", function() {
            var match = frcdb.getMatch("2015mnmi2_m1");
            assert.isOk(match);
            assert.isTrue(strictobject.isValidInstance(match, "match"));
        });

        after(function() {
            frcdb.deleteMatch("2015mnmi2_m1");
        });
    });

    describe("saveMatch(match)", function() {
        it("should work for valid matches", function() {
            var match = {
                "key": "2015mnmi2_m2",
                "time": 12345678,
                "alliances": {
                    "red": {
                        "score": 30,
                        "teams": [
                            2220,
                            2052,
                            254
                        ]
                    },
                    "blue": {
                        "score": 40,
                        "teams": [
                            16,
                            1816,
                            2056
                        ]
                    }
                }
            };
            assert.isTrue(frcdb.saveMatch(match));
        });
        it("should fail for invalid teams (but not throw exception)", function() {
            var match = {
                "key": "2015mnmi2_m3"
            };
            assert.isFalse(frcdb.saveMatch(match));
            assert.doesNotThrow(function() {
                frcdb.saveMatch(match);
            });
        });
    });

    describe("deleteMatch(matchKey)", function() {
        before(function() {
            frcdb.saveMatch({
                "key": "2015mnmi2_m1",
                "time": 12345678,
                "alliances": {
                    "red": {
                        "score": 30,
                        "teams": [
                            2220,
                            2052,
                            254
                        ]
                    },
                    "blue": {
                        "score": 40,
                        "teams": [
                            16,
                            1816,
                            2056
                        ]
                    }
                }
            });
        });

        it("should return false for unknown matches", function() {
            assert.isFalse(frcdb.deleteMatch("2015mnmi2_notamatch"));
        });
        it("should return true for successful deletion", function() {
            assert.isTrue(frcdb.deleteMatch("2015mnmi2_m1"));
            assert.isUndefined(frcdb.getMatch("2015mnmi2_m1"));
        });

        after(function() {
            frcdb.deleteMatch("2015mnmi2_m1");
        });
    });
});
