"use strict";
var assert = require("assert"),
	AnyElementExpression = require("../../../../lib/pipeline/expressions/AnyElementExpression"),
	Expression = require("../../../../lib/pipeline/expressions/Expression");


module.exports = {

	"AnyElementExpression": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new AnyElementExpression();
				});
			}

		},

		"#getOpName()": {

			"should return the correct op name; $anyElement": function testOpName(){
				assert.equal(new AnyElementExpression().getOpName(), "$anyElement");
			}

		},

		"#evaluateInternal()": {

			// "should return error if called without array; 1": function testNonArray(){
			//   assert.throws((Expression.parseOperand().evaluateInternal(new ConstantExpression(1))), false);
			// },

			"should return true if only true was given; {true}": function testEmpty(){
				assert.equal(Expression.parseOperand({$anyElement:[true]}).evaluateInterna(), true);
			},

		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
