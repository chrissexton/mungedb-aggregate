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

					"should not throw Error when constructing with an arg": function testConstructor() {
							assert.doesNotThrow(function() {
									new DateToString("1/1/2014");
							});
					}

			},
		}
	}