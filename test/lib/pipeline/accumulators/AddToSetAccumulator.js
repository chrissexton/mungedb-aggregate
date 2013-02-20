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

			"should throw an error when given a non-array to evaluate": function testArrayValidity() {
				assert.throws(function() {
					var acc = createAccumulator();
					acc.evaluate({b:5});
					var value = acc.getValue();
				});
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
