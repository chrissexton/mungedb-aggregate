"use strict";

var assert = require("assert"),
	FixedArityExpressionT = require("../../../../lib/pipeline/expressions/FixedArityExpressionT");


//TODO: refactor these test cases using Expression.parseOperand() or something because these could be a whole lot cleaner...
module.exports = {

	"FixedArityExpressionT": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor() {
				assert.doesNotThrow(function () {
					new FixedArityExpressionT({}, 1);
				});
			},

		},

		"#validateArguments": {

			"should not throw when number of args matches the template nArgs": function matches() {
				var klass = FixedArityExpressionT(String,1),
					instance = new klass();
				assert.doesNotThrow(function() {
					instance.validateArguments(["arg"]);
				});
			}

		}
	}
};


if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);