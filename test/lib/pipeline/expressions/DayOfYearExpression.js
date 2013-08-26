"use strict";
var assert = require("assert"),
	DayOfYearExpression = require("../../../../lib/pipeline/expressions/DayOfYearExpression"),
	Expression = require("../../../../lib/pipeline/expressions/Expression");


module.exports = {

	"DayOfYearExpression": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new DayOfYearExpression();
				});
			}

		},

		"#getOpName()": {

			"should return the correct op name; $dayOfYear": function testOpName(){
				assert.equal(new DayOfYearExpression().getOpName(), "$dayOfYear");
			}

		},

		"#getFactory()": {

			"should return the constructor for this class": function factoryIsConstructor(){
				assert.strictEqual(new DayOfYearExpression().getFactory(), undefined);
			}

		},

		"#evaluate()": {

			"should return day of year; 49 for 2013-02-18": function testStuff(){
				assert.strictEqual(Expression.parseOperand({$dayOfYear:"$someDate"}).evaluate({someDate:new Date("2013-02-18T00:00:00.000Z")}), 49);
			}

		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
