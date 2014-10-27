"use strict";

var assert = require("assert"),
	VariadicExpressionT = require("../../../../lib/pipeline/expressions/VariadicExpressionT"),
	NaryExpressionT = require("../../../../lib/pipeline/expressions/NaryExpressionT");


//TODO: refactor these test cases using Expression.parseOperand() or something because these could be a whole lot cleaner...
module.exports = {

	"VariadicExpression": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor() {
				assert.doesNotThrow(function () {
					new VariadicExpressionT({});
				});
			},

			"should be an instance of NaryExpression": function () {
				var VariadicExpressionString = VariadicExpressionT(String);
				assert.doesNotThrow(function() {
					var ves = new VariadicExpressionString();
				});
				var ves = new VariadicExpressionString();
				assert(ves.addOperand);
				assert(ves.validateArguments);
				//.... and so on. These prove we have a NaryExpression
			}
		}
	}
};


if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);