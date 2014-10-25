"use strict";
var assert = require("assert"),
	AddToSetAccumulator = require("../../../../lib/pipeline/accumulators/AddToSetAccumulator");

// Mocha one-liner to make these tests self-hosted
if(!module.parent)return(require.cache[__filename]=null,(new(require("mocha"))({ui:"exports",reporter:"spec",grep:process.env.TEST_GREP})).addFile(__filename).run(process.exit));

var testData = {
	nil: null,
	bF: false, bT: true,
	numI: 123, numF: 123.456,
	str: "TesT! mmm π",
	obj: {foo:{bar:"baz"}},
	arr: [1, 2, 3, [4, 5, 6]],
	date: new Date(),
	re: /foo/gi,
};

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
			acc.processInternal(testData);
			assert.deepEqual(acc.getValue(), [testData]);
		},

		"should add input iff not already in set": function testUniquelyAddsToSet() {
			var acc = AddToSetAccumulator.create();
			acc.processInternal(testData);
			acc.processInternal(testData);
			assert.deepEqual(acc.getValue(), [testData]);
		},

		"should merge input into set": function testMergeAddsToSet() {
			var acc = AddToSetAccumulator.create();
			acc.processInternal(testData);
			acc.processInternal([testData, 42], true);
			assert.deepEqual(acc.getValue(), [42, testData]);
		},

	},

	"#getValue()": {

		"should return empty set initially": function testGetsEmpty() {
			var acc = new AddToSetAccumulator.create();
			var value = acc.getValue();
			assert.equal((value instanceof Array), true);
			assert.equal(value.length, 0);
		},

		"should return set of added items": function test() {
			var acc = AddToSetAccumulator.create(),
				expected = [
					42,
					{foo:1, bar:2},
					{bar:2, foo:1},
					testData
				];
			expected.forEach(function(input){
				acc.processInternal(input);
			});
			assert.deepEqual(acc.getValue(), expected);
		},

	}

};
