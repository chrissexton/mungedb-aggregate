"use strict";
var assert = require("assert"),
		DayOfMonthExpression = require("../../../../lib/pipeline/expressions/DayOfMonthExpression"),
		Expression = require("../../../../lib/pipeline/expressions/Expression");


module.exports = {

		"DayOfMonthExpression": {

				"constructor()": {

						"should throw Error when constructing without args": function testConstructor() {
								assert.throws(function() {
										new DayOfMonthExpression();
								});
						},

						"should not throw Error when constructing with an arg": function testConstructor() {
								assert.doesNotThrow(function() {
										new DayOfMonthExpression("1/1/2014");
								});
						}

				},

				"#getOpName()": {

						"should return the correct op name; $dayOfMonth": function testOpName() {
								assert.equal(new DayOfMonthExpression("1/1/2014").getOpName(), "$dayOfMonth");
						}

				},

				"#evaluateInternal()": {

						"should return day of month; 18 for 2013-02-18": function testStuff() {
								assert.strictEqual(Expression.parseOperand({
										$dayOfMonth: "$someDate"
								}).evaluateInternal({
										someDate: new Date("2013-02-18T00:00:00.000Z")
								}), 18);
						}

				}

		}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);