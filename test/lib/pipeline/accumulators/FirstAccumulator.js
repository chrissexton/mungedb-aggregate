"use strict";
var assert = require("assert"),
	FirstAccumulator = require("../../../../lib/pipeline/accumulators/FirstAccumulator"),
	FieldPathExpression = require("../../../../lib/pipeline/expressions/FieldPathExpression");


function createAccumulator(){
	var firstAccumulator = new FirstAccumulator();
	firstAccumulator.addOperand(new FieldPathExpression("a") );
	return firstAccumulator;
}


module.exports = {

	"FirstAccumulator": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new FirstAccumulator();
				});
			}

		},

		"#getOpName()": {

			"should return the correct op name; $first": function testOpName(){
				assert.equal(new FirstAccumulator().getOpName(), "$first");
			}

		},

		"#getFactory()": {

			"should return the constructor for this class": function factoryIsConstructor(){
				assert.strictEqual(new FirstAccumulator().getFactory(), FirstAccumulator);
			}

		},

		"#evaluate()": {

			"The accumulator evaluates no documents": function none() {
				// The accumulator returns no value in this case.
				var acc = createAccumulator();
				assert.ok(!acc.getValue());
			},

			"The accumulator evaluates one document and retains its value": function one() {
				var acc = createAccumulator();
				acc.evaluate({a:5});
				assert.strictEqual(acc.getValue(), 5);
			},

			"The accumulator evaluates one document with the field missing retains undefined": function missing() {
				var acc = createAccumulator();
				acc.evaluate({});
				assert.strictEqual(acc.getValue(), undefined);
			},

			"The accumulator evaluates two documents and retains the value in the first": function two() {
				var acc = createAccumulator();
				acc.evaluate({a:5});
				acc.evaluate({a:7});
				assert.strictEqual(acc.getValue(), 5);
			},

			"The accumulator evaluates two documents and retains the undefined value in the first": function firstMissing() {
				var acc = createAccumulator();
				acc.evaluate({});
				acc.evaluate({a:7});
				assert.strictEqual(acc.getValue(), undefined);
			}
		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
