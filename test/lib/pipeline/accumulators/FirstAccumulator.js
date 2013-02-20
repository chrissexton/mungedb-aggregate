var assert = require("assert"),
	FirstAccumulator = require("../../../../lib/pipeline/accumulators/FirstAccumulator"),
	Expression = require("../../../../lib/pipeline/expressions/Expression");

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

			/*
			"should return day of year; 49 for 2013-02-18": function testStuff(){
				assert.strictEqual(Expression.parseOperand({$dayOfYear:"$someDate"}).evaluate({someDate:new Date("2013-02-18 EST")}), 49);
			},
			*/

			"The accumulator evaluates no documents": function none() {
				// The accumulator returns no value in this case.
				assert.ok(Expression.parseOperand({$first:"$a"}).evaluate());
			},

			"The accumulator evaluates one document and retains its value": function one() {
				assert.strictEqual(Expression.parseOperand({$first:"$a"}).evaluate({a:5}), 5);
			},

			"The accumulator evaluates one document with the field missing retains undefined": function missing() {
				assert.strictEqual(Expression.parseOperand({$first:"$a"}).evaluate({}), undefined);
			},

			"The accumulator evaluates two documents and retains the value in the first": function two() {
				assert.strictEqual(Expression.parseOperand({$first:"$a"}).evaluate([{a:5}, {a:7}]), 5);
			},

			"The accumulator evaluates two documents and retains the undefined value in the first": function firstMissing() {
				assert.strictEqual(Expression.parseOperand({$first:"$a"}).evaluate([{}, {a:7}]), undefined);
			}
		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);

