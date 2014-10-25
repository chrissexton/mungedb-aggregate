"use strict";
var assert = require("assert"),
	Value = require("../../../lib/pipeline/Value");

// Mocha one-liner to make these tests self-hosted
if(!module.parent)return(require.cache[__filename]=null,(new(require("mocha"))({ui:"exports",reporter:"spec",grep:process.env.TEST_GREP})).addFile(__filename).run(process.exit));

exports.Value = {

	".constructor()": {

		"should throw an error when used": function ctorThrows() {
			assert.throws(function() {
				new Value();
			});
		}

	},

	".coerceToBool()": {

		"should be tested": function(){
			assert.equal("TESTS", "NO");
		},

	},

	".coerceToNumber()": {

		"should be tested": function(){
			assert.equal("TESTS", "NO");
		},

	},

	".coerceToDate()": {

		"should be tested": function(){
			assert.equal("TESTS", "NO");
		},

	},

	".coerceToString()": {

		"should be tested": function(){
			assert.equal("TESTS", "NO");
		},

	},

	".cmp()": {

		"should be tested": function(){
			assert.equal("TESTS", "NO");
		},

	},

	".compare()": {

		"follows canonical type order when types differ": function throwsWhenDiffTypes() {
			var a = 5,
				b = "hi",
				actual = Value.compare(a,b);
			assert.equal(actual, -1);
		},

		"should compare two numbers": function comparesNumbers() {
			var a = 5,
				b = 6,
				actual = Value.compare(a,b);
			assert.equal(actual, -1);
		},

		"should compare two strings": function comparesStrings() {
			var a = "a",
				b = "b",
				actual = Value.compare(b,a);
			assert.equal(actual, 1);
		},

		"should detect the same object": function compareSameObj() {
			var a = {},
				b = a,
				actual = Value.compare(a,b);
			assert.equal(actual, 0);
		}

	},

	".consume()": {

		"should return an equivalent array, empty the original":function works() {
			var testArray = [5,6,"hi"],
				result = Value.consume(testArray);
			assert.deepEqual([5,6,"hi"], result); // tests that insides were copied
			assert.notEqual(testArray, result);   // tests that a new array was returned
			assert.equal(testArray.length, 0);    // tests that the old array was emptied
		},

		"should work given an empty array":function worksWhenEmpty() {
			var testArray = [],
				result = Value.consume(testArray);
			assert.deepEqual([], result);
			assert.equal(testArray.length, 0);
		}

	},

	".canonicalize()": {

		"should be tested": function(){
			assert.equal("TESTS", "NO");
		},

	}

};
