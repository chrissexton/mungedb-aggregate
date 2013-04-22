"use strict";
var assert = require("assert"),
	DayOfWeekExpression = require("../../../../lib/pipeline/expressions/DayOfWeekExpression"),
	Expression = require("../../../../lib/pipeline/expressions/Expression");


module.exports = {

	"DayOfWeekExpression": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new DayOfWeekExpression();
				});
			}

		},

		"#getOpName()": {

			"should return the correct op name; $dayOfWeek": function testOpName(){
				assert.equal(new DayOfWeekExpression().getOpName(), "$dayOfWeek");
			}

		},

		"#getFactory()": {

			"should return the constructor for this class": function factoryIsConstructor(){
				assert.strictEqual(new DayOfWeekExpression().getFactory(), undefined);
			}

		},

		"#evaluate()": {

			"should return day of week; 2 for 2013-02-18": function testStuff(){
				assert.strictEqual(Expression.parseOperand({$dayOfWeek:"$someDate"}).evaluate({someDate:new Date("Mon Feb 18 2013 00:00:00 GMT-0500 (EST)")}), 2);
			}

		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
