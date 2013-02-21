var assert = require("assert"),
	AddToSetAccumulator = require("../../../../lib/pipeline/accumulators/AddToSetAccumulator"),
	ConstantExpression = require("../../../../lib/pipeline/expressions/ConstantExpression"),
	FieldPathExpression = require("../../../../lib/pipeline/expressions/FieldPathExpression");

var createAccumulator = function createAccumulator() {
	var myAccumulator = new AddToSetAccumulator();
	myAccumulator.addOperand(new FieldPathExpression("b") );
	return myAccumulator;
};

//TODO: refactor these test cases using Expression.parseOperand() or something because these could be a whole lot cleaner...
module.exports = {

	"AddToSetAccumulator": {

		"constructor()": {

			"should error if called with args": function testArgsGivenToCtor() {
				assert.throws(function() {
					var acc = new AddToSetAccumulator('arg');
				});
			},

			"should construct object with set property": function testCtorAssignsSet() {
				var acc = new AddToSetAccumulator();
				assert.notEqual(acc.set, null);
				assert.notEqual(acc.set, undefined);
			}

		},

		"#evaluate()" : {

			"should error if evaluate is called with no args": function testNoArgs() {
				assert.throws(function() {
					var acc = new createAccumulator();
					acc.evaluate();
				});
			},

			"should error if evaluate is called with more than one arg": function testTooManyArgs() {
				assert.throws(function() {
					var acc = new createAccumulator();
					acc.evaluate({}, {});
				});
			},

			"should throw an error when given a non-array to evaluate": function testArrayValidity() {
				assert.throws(function() {
					var acc = createAccumulator();
					acc.evaluate({b:5});
				});
			}

		},

		"#getValue()": {

			"should return empty array": function testEmptySet() {
				var acc = new createAccumulator();
				var value = acc.getValue();
				assert.equal((value instanceof Array), true);
				assert.equal(value.length, 0);
			},

			"should return array with one element that equals 5": function test5InSet() {
				var acc = createAccumulator();
				acc.evaluate({b:[5]});
				var value = acc.getValue();
				assert.equal((value instanceof Array), true);
				assert.equal(value.length, 1);
				assert.equal(value[0], 5);
			},

			"should produce value that is an array of multiple elements": function testMultipleItems() {
				var acc = createAccumulator();
				acc.evaluate({b:[5, {key: "value"}]});
				var value = acc.getValue();
				assert.equal((value instanceof Array), true);
				assert.equal(value.length, 2);
				assert.equal((value[0] instanceof Object || value[1] instanceof Object) && (typeof value[0] == 'number' || typeof value[1] == 'number'), true);
				//assert.equal(value[0], 5);
			},

			"should return array with one element that is an object containing a key/value pair": function testKeyValue() {
				var acc = createAccumulator();
				acc.evaluate({b:[{key: "value"}]});
				var value = acc.getValue();
				assert.equal((value instanceof Object), true);
				assert.equal(value.length, 1);
				assert.equal(value[0].key == "value", true);
			}

		}
	}
};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
