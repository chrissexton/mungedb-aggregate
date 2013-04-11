"use strict";
var assert = require("assert"),
	MinAccumulator = require("../../../../lib/pipeline/accumulators/MinMaxAccumulator"),
	FieldPathExpression = require("../../../../lib/pipeline/expressions/FieldPathExpression");


function createAccumulator(){
	var minAccumulator = MinAccumulator.createMin();
	minAccumulator.addOperand(new FieldPathExpression("a") );
	return minAccumulator;
}


module.exports = {

	"MinAccumulator": {

		"constructor()": {

			"should not throw Error when constructing without args using createMin": function testConstructor(){
				assert.doesNotThrow(function(){
					MinAccumulator.createMin();
				});
			},

			"should throw Error when constructing without args using default constructor": function testConstructor(){
				assert.throws(function(){
					new MinAccumulator();
				});
			}

		},

		"#getOpName()": {

			"should return the correct op name; $min": function testOpName(){
				var acc = createAccumulator();
				assert.equal(acc.getOpName(), "$min");
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

			"The accumulator evaluates two documents and retains the minimum": function two() {
				var acc = createAccumulator();
				acc.evaluate({a:5});
				acc.evaluate({a:7});
				assert.strictEqual(acc.getValue(), 5);
			},

			"The accumulator evaluates two documents and retains the undefined value in the last": function lastMissing() {
				var acc = createAccumulator();
				acc.evaluate({a:7});
				acc.evaluate({});
				assert.strictEqual(acc.getValue(), undefined);
			}
		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
