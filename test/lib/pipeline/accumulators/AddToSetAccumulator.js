"use strict";
var assert = require("assert"),
	AddToSetAccumulator = require("../../../../lib/pipeline/accumulators/AddToSetAccumulator");

// Mocha one-liner to make these tests self-hosted
if(!module.parent)return(require.cache[__filename]=null,(new(require("mocha"))({ui:"exports",reporter:"spec",grep:process.env.TEST_GREP})).addFile(__filename).run(process.exit));

//TODO: refactor these test cases using Expression.parseOperand() or something because these could be a whole lot cleaner...
exports.AddToSetAccumulator = {

	".constructor()": {

		"should create instance of Accumulator": function testCtorAssignsSet() {
			assert(AddToSetAccumulator.create() instanceof AddToSetAccumulator);
		},

		"should error if called with args": function testArgsGivenToCtor() {
			assert.throws(function() {
				new AddToSetAccumulator(123);
			});
		}

	},

	".create()": {

		"should return an instance of the accumulator": function testCreate() {
			assert(AddToSetAccumulator.create() instanceof AddToSetAccumulator);
		}

	},

	"#processInternal()": {

		"should add input to set": function testAddsToSet() {
			var acc = AddToSetAccumulator.create();
			acc.processInternal(5);
			var value = acc.getValue();
			assert.deepEqual(JSON.stringify(value), JSON.stringify([5]));
		}

	},

	"#getValue()": {

		"should return empty array": function testEmptySet() {
			var acc = new AddToSetAccumulator.create();
			var value = acc.getValue();
			assert.equal((value instanceof Array), true);
			assert.equal(value.length, 0);
		},

		"should return array with one element that equals 5": function test5InSet() {
			var acc = AddToSetAccumulator.create();
			acc.processInternal(5);
			acc.processInternal(5);
			var value = acc.getValue();
			assert.deepEqual(JSON.stringify(value), JSON.stringify([5]));
		},

		"should produce value that is an array of multiple elements": function testMultipleItems() {
			var acc = AddToSetAccumulator.create();
			acc.processInternal(5);
			acc.processInternal({key: "value"});
			var value = acc.getValue();
			assert.deepEqual(JSON.stringify(value), JSON.stringify([5, {key: "value"}]));
		},

		"should return array with one element that is an object containing a key/value pair": function testKeyValue() {
			var acc = AddToSetAccumulator.create();
			acc.processInternal({key: "value"});
			var value = acc.getValue();
			assert.deepEqual(JSON.stringify(value), JSON.stringify([{key: "value"}]));
		},

		"should coalesce different instances of equivalent objects": function testGetValue_() {
			var acc = AddToSetAccumulator.create();
			acc.processInternal({key: "value"});
			acc.processInternal({key: "value"});
			var value = acc.getValue();
			assert.deepEqual(JSON.stringify(value), JSON.stringify([{key: "value"}]));
		}

	}

};
