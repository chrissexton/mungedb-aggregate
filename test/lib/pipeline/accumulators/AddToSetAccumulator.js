
var assert = require("assert"),
	AddToSetAccumulator = require("../../../../lib/pipeline/accumulators/AddToSetAccumulator"),
	FieldPathExpression = require("../../../../lib/pipeline/expressions/FieldPathExpression");


function createAccumulator(){
	var accumulator = new AddToSetAccumulator();
	accumulator.addOperand(new FieldPathExpression("b") );
	return accumulator;
}


module.exports = {

	"AddToSetAccumulator": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new AddToSetAccumulator();
				});
			}

		},

		"#getOpName()": {

			"should return the correct op name; $addToSet": function testOpName(){
				assert.strictEqual(new AddToSetAccumulator().getOpName(), "$addToSet");
			}

		},

		"#evaluate()": {

			"should evaluate no documents": function testStuff(){
				var accumulator = createAccumulator();
				accumulator.evaluate();
				assert.deepEqual(accumulator.getValue(), []);
			},


			"should evaluate one document and return an set of 1: [1]": function testStuff(){
				var accumulator = createAccumulator();
				accumulator.evaluate({b:1});
				assert.deepEqual(accumulator.getValue(), [1]);
			},

			"should evaluate two documents with the same value and return a set of 1: [1]": function testStuff(){

				var accumulator = createAccumulator();
				accumulator.evaluate({b:1});
				accumulator.evaluate({b:1});
				assert.deepEqual(accumulator.getValue(), [1]);
			},

			"should evaluate two documents with the same objects as values and return a set of 1: [{foo:'bar'}]": function testStuff(){

				var accumulator = createAccumulator();
				accumulator.evaluate({b:{foo:"bar"}});
				accumulator.evaluate({b:{foo:"bar"}});
				assert.deepEqual(accumulator.getValue(), [{foo:"bar"}]);
			},


			"should evaluate two documents with the same arrays as values and return a set of 1: [[1,2,3]]": function testStuff(){

				var accumulator = createAccumulator();
				accumulator.evaluate({b:[1,2,3]});
				accumulator.evaluate({b:[1,2,3]});
				assert.deepEqual(accumulator.getValue(), [[1,2,3]]);
			},


			"should evaluate two documents with different values and return a set of 2: [1,2]": function testStuff(){

				var accumulator = createAccumulator();
				accumulator.evaluate({b:1});
				accumulator.evaluate({b:2});
				assert.deepEqual(accumulator.getValue(), [1,2]);
			},

			"should evaluate two documents with the different objects as values and return a set of 2: [{foo:'bar'},{foo:'baz'}]": function testStuff(){

				var accumulator = createAccumulator();
				accumulator.evaluate({b:{foo:"bar"}});
				accumulator.evaluate({b:{foo:"baz"}});
				assert.deepEqual(accumulator.getValue(), [{foo:"bar"},{foo:"baz"}]);
			},


			"should evaluate two documents with the different arrays as values and return a set of 1: [[1,2,3], [1,2]]": function testStuff(){

				var accumulator = createAccumulator();
				accumulator.evaluate({b:[1,2,3]});
				accumulator.evaluate({b:[1,2]});
				assert.deepEqual(accumulator.getValue(), [[1,2,3], [1,2]]);
			},



			"should evaluate one document with null and one document with a value and return an set of 1: [1]": function testStuff(){
				var accumulator = createAccumulator();
				accumulator.evaluate({b:1});
				accumulator.evaluate({b:null});
				assert.deepEqual(accumulator.getValue(), [1]);
			}

		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);








