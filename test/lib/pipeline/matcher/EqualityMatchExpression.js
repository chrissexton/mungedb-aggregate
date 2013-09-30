"use strict";
var assert = require("assert"),
	EqualityMatchExpression = require("../../../../lib/pipeline/matcher/EqualityMatchExpression");


module.exports = {

	"EqualityMatchExpression": {

		"should initialize equality and match numbers or numbers in arrays": function (){
			var e = new EqualityMatchExpression();
			var s = e.init('x', 5);
			assert.strictEqual(s.code, 'OK');

			assert.ok(e.matches({x:5}));
			assert.ok(e.matches({x:[5]}));
			assert.ok(e.matches({x:[1,5]}));
			assert.ok(e.matches({x:[1,5,2]}));
			assert.ok(e.matches({x:[5,2]}));

			assert.ok(!e.matches({x:null}));
			assert.ok(!e.matches({x:6}));
			assert.ok(!e.matches({x:[4,2]}));
			assert.ok(!e.matches({x:[[5]]}));
		},

//NOTE: from expression_leaf_test.cpp
		"should match elements": function testMatchesElement(){
			var operand = {a:5},
				match = {a:5.0},
				notMatch = {a:6};

			var eq = new EqualityMatchExpression();
			eq.init("a", operand.a);

			assert.ok(eq.matches(match));
			assert.ok(!eq.matches(notMatch));

			assert.ok(eq.equivalent(eq));
		},

		"should handle invalid End of Object Operand": function testInvalidEooOperand(){
		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);

