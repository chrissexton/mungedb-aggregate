"use strict";
var assert = require("assert"),
	DayOfMonthExpression = require("../../../../lib/pipeline/expressions/DayOfMonthExpression"),
	Expression = require("../../../../lib/pipeline/expressions/Expression");


module.exports = {

	"DayOfMonthExpression": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new DayOfMonthExpression();
				});
			}

		},

		"#getOpName()": {

			"should return the correct op name; $dayOfMonth": function testOpName(){
				assert.equal(new DayOfMonthExpression().getOpName(), "$dayOfMonth");
			}

		},

		"#getFactory()": {

			"should return the constructor for this class": function factoryIsConstructor(){
				assert.strictEqual(new DayOfMonthExpression().getFactory(), undefined);
			}

		},

		"#evaluate()": {

			"should return day of month; 18 for 2013-02-18": function testStuff(){
				assert.strictEqual(Expression.parseOperand({$dayOfMonth:"$someDate"}).evaluate({someDate:new Date("2013-02-18")}), 18);
			}

		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
