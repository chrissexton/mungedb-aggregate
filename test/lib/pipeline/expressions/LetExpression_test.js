"use strict";
var assert = require("assert"),
	LetExpression = require("../../../../lib/pipeline/expressions/LetExpression"),
	Expression = require("../../../../lib/pipeline/expressions/Expression");


module.exports = {

	"LetExpression": {

		"constructor()": {

			"should throw when there are not 2 args": function testConstructorNot2() {
				assert.throws(function () {
					new LetExpression({});
				});
				assert.throws(function () {
					new LetExpression({}, {}, {});
				});
			},
			"should not throw when there are 2 args": function testConstructor2() {
				assert.doesNotThrow(function () {
					new LetExpression({}, {});
				});
			}
		},

		"#parse()": {
			"should throw if $let isn't in expr": function () {
				assert.throws(function(){
					new LetExpression.parse({$noLetIsHere:1}, {})
				});
			},
			"should throw if the $let expression isn't an object": function () {
				assert.throws(function(){
					new LetExpression.parse({$expr:"this is not an object"}, {})
				});
			},
			"should throw if the $let expression is an array": function () {
				assert.throws(function(){
					new LetExpression.parse({$expr:[1,2,3]}, {})
				});
			},
			"should throw if there is no vars parameter to $let": function () {
				assert.throws(function(){
					new LetExpression.parse({$expr:{noVars:1}}, {})
				});
			},
			"should throw if there is no input parameter to $let": function () {
				assert.throws(function(){
					new LetExpression.parse({$expr:{vars:1, noIn:2}}, {})
				});
			},
			"should throw if any of the arguments to $let are not 'in' or 'var'": function () {
				assert.throws(function(){
					new LetExpression.parse({$expr:{vars:1, in:2, zoot:3}}, {})
				});
			},
			"should throw if the var name is not writable": function () {
				assert.throws(function(){
					new LetExpression.parse({$expr:{vars:["$$bad$$"], in:2}}, {})
				});
			},
			"should return a Let expression": function () {
				var letExpression = new LetExpression.parse({$expr:{vars:["$valid"], in:2}}, {})
				assert(letExpression);
				assert(false);	// I don't know how to test this yet.
			}
		},

		"#optimize()": {
			"should optimize subexpressions if there are no variables": function () {
				assert(fail);
			},
			"should optimize variables": function () {
				assert(fail);
			},
			"should optimize subexpressions if there are variables": function () {
				assert(fail);
			}
		},
		"#serialize()": {
			"should serialize variables and the subexpression": function () {
				assert(fail);
			}
		},
		"#evaluateInternal()": {
			"should preform the evaluation for variables and the subexpression": function () {
				assert(fail);
			}
		},
		"#addDependencies()": {
			"add dependencies to the variables and the subexpression": function () {
				assert(fail);
			}
		}
	}

};

if (!module.parent)(new (require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);