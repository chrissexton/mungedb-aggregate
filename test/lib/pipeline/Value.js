"use strict";
var assert = require("assert"),
	Value = require("../../../lib/pipeline/Value");

module.exports = {

	"Value": {

		"#ctor": {

			"should throw an error when used": function ctorThrows() {
				assert.throws(function() {
					var val = new Value();
				});
			}

		},

		"#consume": {

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

		"#compare": {

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
				var a = 'a',
					b = 'b',
					actual = Value.compare(b,a);
				assert.equal(actual, 1);
			},

			"should detect the same object": function compareSameObj() {
				var a = {},
					b = a,
					actual = Value.compare(a,b);
				assert.equal(actual, 0);
			}

		}

	}
};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).grep(process.env.MOCHA_GREP || '').run(process.exit);
