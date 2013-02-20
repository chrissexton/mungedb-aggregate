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

			"should evaluate no documents": function testStuff(){
				var accumulator = createAccumulator();
				accumulator.evaluate();
				assert.deepEqual(accumulator.getValue(), []);
			},


			"should evaluate one document and return an array of 1": function testStuff(){
				var accumulator = createAccumulator();
				accumulator.evaluate({b:1});
				assert.deepEqual(accumulator.getValue(), [1]);
			},

			"should evaluate two documents and return an array of 2": function testStuff(){

				var accumulator = createAccumulator();
				accumulator.evaluate({b:1});
				accumulator.evaluate({b:2});
				assert.deepEqual(accumulator.getValue(), [1,2]);
			},

			"should evaluate one document with null and one document with a value and return an array of 1": function testStuff(){
				var accumulator = createAccumulator();
				accumulator.evaluate({b:1});
				accumulator.evaluate({b:null});
				assert.deepEqual(accumulator.getValue(), [1]);
			}

		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);


