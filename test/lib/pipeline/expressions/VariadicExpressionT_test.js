"use strict";

var assert = require("assert"),
	VariadicExpressionT = require("../../../../lib/pipeline/expressions/VariadicExpressionT"),
	NaryExpressionT = require("../../../../lib/pipeline/expressions/NaryExpressionT");


//TODO: refactor these test cases using Expression.parseOperand() or something because these could be a whole lot cleaner...
module.exports = {

	"VariaticExpression": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor() {
				assert.doesNotThrow(function () {
					new VariadicExpressionT({});
				});
			},

			"should be an instance of NaryExpression": function () {
				assert(new VariadicExpressionT() instanceof NaryExpression);
			}
		}
	}
};


if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);