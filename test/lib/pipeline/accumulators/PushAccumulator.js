"use strict";
var assert = require("assert"),
	PushAccumulator = require("../../../../lib/pipeline/accumulators/PushAccumulator"),
	FieldPathExpression = require("../../../../lib/pipeline/expressions/FieldPathExpression");


function createAccumulator(){
	var accumulator = new PushAccumulator();
	accumulator.addOperand(new FieldPathExpression("b") );
	return accumulator;
}


module.exports = {

	"PushAccumulator": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new PushAccumulator();
				});
			}

		},

		"#getOpName()": {

			"should return the correct op name; $push": function testOpName(){
				assert.strictEqual(new PushAccumulator().getOpName(), "$push");
			}

		},

		"#evaluate()": {

			"should evaluate no documents and return []": function testEvaluate_None(){
				var accumulator = createAccumulator();
				assert.deepEqual(accumulator.getValue(), []);
			},

			"should evaluate a 1 and return [1]": function testEvaluate_One(){
				var accumulator = createAccumulator();
				accumulator.evaluate({b:1});
				assert.deepEqual(accumulator.getValue(), [1]);
			},

			"should evaluate a 1 and a 2 and return [1,2]": function testEvaluate_OneTwo(){
				var accumulator = createAccumulator();
				accumulator.evaluate({b:1});
				accumulator.evaluate({b:2});
				assert.deepEqual(accumulator.getValue(), [1,2]);
			},

			"should evaluate a 1 and a null and return [1,null]": function testEvaluate_OneNull(){
				var accumulator = createAccumulator();
				accumulator.evaluate({b:1});
				accumulator.evaluate({b:null});
				assert.deepEqual(accumulator.getValue(), [1, null]);
			},

			"should evaluate a 1 and an undefined and return [1]": function testEvaluate_OneUndefined(){
				var accumulator = createAccumulator();
				accumulator.evaluate({b:1});
				accumulator.evaluate({b:undefined});
				assert.deepEqual(accumulator.getValue(), [1]);
			},

			"should evaluate a 1 and a 0 and return [1,0]": function testEvaluate_OneZero(){
				var accumulator = createAccumulator();
				accumulator.evaluate({b:1});
				accumulator.evaluate({b:0});
				assert.deepEqual(accumulator.getValue(), [1, 0]);
			}

		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
