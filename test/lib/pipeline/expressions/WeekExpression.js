var assert = require("assert"),
	WeekExpression = require("../../../../lib/pipeline/expressions/WeekExpression"),
	Expression = require("../../../../lib/pipeline/expressions/Expression");

module.exports = {

	"WeekExpression": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new WeekExpression();
				});
			}

		},

		"#getOpName()": {

			"should return the correct op name; $week": function testOpName(){
				assert.equal(new WeekExpression().getOpName(), "$week");
			}

		},

		"#getFactory()": {

			"should return the constructor for this class": function factoryIsConstructor(){
				assert.strictEqual(new WeekExpression().getFactory(), undefined);
			}

		},

		"#evaluate()": {

			"should return week; 8 for 2013-02-18": function testStuff(){
				assert.strictEqual(Expression.parseOperand({$week:"$someDate"}).evaluate({someDate:new Date("Mon Feb 18 2013 00:00:00 GMT-0500 (EST)")}), 7);
			}

		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);