"use strict";
var assert = require("assert"),
	SumAccumulator = require("../../../../lib/pipeline/accumulators/SumAccumulator"),
	FieldPathExpression = require("../../../../lib/pipeline/expressions/FieldPathExpression");


function createAccumulator(){
	var sumAccumulator = new SumAccumulator();
	sumAccumulator.addOperand(new FieldPathExpression("b") );
	return sumAccumulator;
}


module.exports = {

	"SumAccumulator": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new SumAccumulator();
				});
			}

		},

		"#getOpName()": {

			"should return the correct op name; $sum": function testOpName(){
				assert.strictEqual(new SumAccumulator().getOpName(), "$sum");
			}

		},

		"#evaluate()": {

			"should evaluate no documents": function testStuff(){
				var sumAccumulator = createAccumulator();
				assert.strictEqual(sumAccumulator.getValue(), 0);
			},

			"should evaluate one document with a field that is NaN": function testStuff(){
				var sumAccumulator = createAccumulator();
				sumAccumulator.evaluate({b:Number("foo")});
				// NaN is unequal to itself
				assert.notStrictEqual(sumAccumulator.getValue(), sumAccumulator.getValue());
			},


			"should evaluate one document and sum it's value": function testStuff(){
				var sumAccumulator = createAccumulator();
				sumAccumulator.evaluate({b:5});
				assert.strictEqual(sumAccumulator.getValue(), 5);

			},


			"should evaluate and sum two ints": function testStuff(){
				var sumAccumulator = createAccumulator();
				sumAccumulator.evaluate({b:5});
				sumAccumulator.evaluate({b:7});
				assert.strictEqual(sumAccumulator.getValue(), 12);
			},

			"should evaluate and sum two ints overflow": function testStuff(){
				var sumAccumulator = createAccumulator();
				sumAccumulator.evaluate({b:Number.MAX_VALUE});
				sumAccumulator.evaluate({b:Number.MAX_VALUE});
				assert.strictEqual(Number.isFinite(sumAccumulator.getValue()), false);
			},


			"should evaluate and sum two negative ints": function testStuff(){
				var sumAccumulator = createAccumulator();
				sumAccumulator.evaluate({b:-5});
				sumAccumulator.evaluate({b:-7});
				assert.strictEqual(sumAccumulator.getValue(), -12);
			},

//TODO Not sure how to do this in Javascript
//			"should evaluate and sum two negative ints overflow": function testStuff(){
//				var sumAccumulator = createAccumulator();
//				sumAccumulator.evaluate({b:Number.MIN_VALUE});
//				sumAccumulator.evaluate({b:7});
//				assert.strictEqual(sumAccumulator.getValue(), Number.MAX_VALUE);
//			},
//

			"should evaluate and sum int and float": function testStuff(){
				var sumAccumulator = createAccumulator();
				sumAccumulator.evaluate({b:8.5});
				sumAccumulator.evaluate({b:7});
				assert.strictEqual(sumAccumulator.getValue(), 15.5);
			},

			"should evaluate and sum one Number and a NaN sum to NaN": function testStuff(){
				var sumAccumulator = createAccumulator();
				sumAccumulator.evaluate({b:8});
				sumAccumulator.evaluate({b:Number("bar")});
				// NaN is unequal to itself
				assert.notStrictEqual(sumAccumulator.getValue(), sumAccumulator.getValue());
			},

			"should evaluate and sum a null value to 0": function testStuff(){
				var sumAccumulator = createAccumulator();
				sumAccumulator.evaluate({b:null});
				assert.strictEqual(sumAccumulator.getValue(), 0);
			}

		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
