"use strict";
var assert = require("assert"),
    ParsedDeps = require("../../../lib/pipeline/ParsedDeps");

module.exports = {
    "ParsedDeps": {
        "_documentHelper": {
            "should skip fields that are not needed": function() {
                var json = {'foo':'bar'},
                    neededFields = {},
                    parse = new ParsedDeps(),
                    expected = {};
                assert.deepEqual(expected, parse._documentHelper(json, neededFields));
            },
            "should return values that are booleans": function() {
                var json = {'foo':'bar'},
                    neededFields = {'foo':true},
                    parse = new ParsedDeps(),
                    expected = {'foo':'bar'};
                assert.deepEqual(expected, parse._documentHelper(json, neededFields));
            },
            "should call _arrayHelper on values that are arrays": function() {
                var json = {'foo':[{'bar':'baz'}]},
                    neededFields = {'foo':true},
                    parse = new ParsedDeps(),
                    expected = {'foo':true};
                // TODO: mock out _arrayHelper to return true
                parse._arrayHelper = function() {
                    return true;
                };
                assert.deepEqual(expected, parse._documentHelper(json, neededFields));
            },
            "should recurse on values that are objects": function() {
                var json = {'foo':{'bar':'baz'}},
                    neededFields = {'foo':true},
                    parse = new ParsedDeps(),
                    expected = {'foo':{'bar':'baz'}};
                assert.deepEqual(expected, parse._documentHelper(json, neededFields));
            }
        },
        "_arrayHelper": {
            "should call _documentHelper on values that are objects": function() {
                var array = [{'foo':'bar'}],
                    neededFields = {'foo':true},
                    parse = new ParsedDeps(),
                    expected = [true];
                // TODO: mock out _documentHelper to return true
                parse._documentHelper = function() {
                    return true;
                };
                assert.deepEqual(expected, parse._arrayHelper(array, neededFields));
            },
            "should recurse on values that are arrays": function() {
                var array = [[{'foo':'bar'}]],
                    neededFields = {'foo':true},
                    parse = new ParsedDeps(),
                    expected = [[{'foo':'bar'}]];
                assert.deepEqual(expected, parse._arrayHelper(array, neededFields));
            }
        }
    }
};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run();
