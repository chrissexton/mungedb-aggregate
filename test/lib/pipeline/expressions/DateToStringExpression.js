"use strict";
var assert = require("assert"),
		DateToStringExpression = require("../../../../lib/pipeline/expressions/DateToStringExpression"),
		Expression = require("../../../../lib/pipeline/expressions/Expression"),
		VariablesParseState = require("../../../../Lib/pipeline/expressions/VariablesParseState"),
		VariablesIdGenerator = require("../../../../Lib/pipeline/expressions/VariablesIdGenerator");


module.exports = {

	"DateToStringExpression": {

		"constructor()": {

			"should throw Error when constructing without args": function testConstructor() {
					assert.throws(function() {
							new DateToStringExpression();
					});
			},

			"should not throw Error when constructing with 2 args": function testConstructor() {
					assert.doesNotThrow(function() {
							new DateToString("%Y%m%d", "1/1/2014");
					});
			}
		},

		"#getOpName()" : {

			"should return the correct opName: $dateToString": function testOpName() {
				assert.equal(new DateToStringExpression("%Y%m%d", "1/1/2014").getOpName(), "$dateToString");
			};
		},

		"evaluateInternal1()" : {
			"should return the date to string": function evaluateInternal1() {
				assert.equal(new DateToStringExpression("%Y%m%d", "1/1/2014").evaluateInternal(), "2014/1/1");
			};
		}
	}
}