"use strict";
var assert = require("assert"),
	AndMatchExpression = require("../../../../lib/pipeline/matcher/AndMatchExpression"),
	LTMatchExpression = require("../../../../lib/pipeline/matcher/LTMatchExpression"),
	GTMatchExpression = require("../../../../lib/pipeline/matcher/GTMatchExpression"),
	RegexMatchExpression = require("../../../../lib/pipeline/matcher/RegexMatchExpression"),
	EqualityMatchExpression = require("../../../../lib/pipeline/matcher/EqualityMatchExpression"),
	NotMatchExpression = require("../../../../lib/pipeline/matcher/EqualityMatchExpression");


module.exports = {
	"AndMatchExpression": {
		"Should match nothing with no clauses": function (){
			var op = new AndMatchExpression();
			assert.ok( op.matches({}));
		},
		"Should match with a three element clause": function() {
			var lt = new LTMatchExpression();
			var gt = new GTMatchExpression();
			var rgx = new RegexMatchExpression();
			var op = new AndMatchExpression();
			assert.strictEqual( lt.init('a','z1').code,'OK');
			assert.strictEqual( gt.init('a','a1').code,'OK');
			assert.strictEqual( rgx.init('a','1','').code,'OK');
			op.add(lt);
			op.add(gt);
			op.add(rgx);
			assert.ok( op.matches({'a':'r1'}) );
			assert.ok( ! op.matches({'a': 'z1'}) );
			assert.ok( ! op.matches({'a': 'a1'}) );
			assert.ok( ! op.matches({'a':'r'}) );
		},
		"Should match a single clause": function() {
			var nop = new NotMatchExpression();
			var eq = new EqualityMatchExpression();
			var op = new AndMatchExpression();

			assert.strictEqual( eq.init('a', 5).code,'OK');
			assert.strictEqual( nop.init(eq).code,'OK');
			op.add(nop);
			assert.ok( op.matches({'a':4}) );
			assert.ok( op.matches({'a':[4,6]}) );
			assert.ok( !op.matches({'a':5}) );
			assert.ok( !op.matches({'a':[4,5]}) );
		},
		"Should match three clauses": function(){
		// File expression_tree_test.cpp lines 144-168

			assert.ok(false, 'Fill out test');

		},
		"Should have an elemMatchKey": function(){
		// File expression_tree_test.cpp lines 170 - 195

			assert.ok(false, 'Fill out test');
		}


	}
};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);

