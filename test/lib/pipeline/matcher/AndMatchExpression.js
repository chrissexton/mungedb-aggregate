"use strict";
var assert = require("assert"),
	AndMatchExpression = require("../../../../lib/pipeline/matcher/AndMatchExpression"),
	LTMatchExpression = require("../../../../lib/pipeline/matcher/LTMatchExpression"),
	GTMatchExpression = require("../../../../lib/pipeline/matcher/GTMatchExpression"),
	RegexMatchExpression = require("../../../../lib/pipeline/matcher/RegexMatchExpression"),
	EqualityMatchExpression = require("../../../../lib/pipeline/matcher/EqualityMatchExpression");



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

			assert.strictEqual( lt.init('a','z1')['code'],'OK');
			assert.strictEqual( gt.init('a','a1')['code'],'OK');
			assert.strictEqual( rgx.init('a','1','')['code'],'OK');
			
			op.add(lt);
			op.add(gt);
			op.add(rgx);

			assert.ok( op.matches({'a':'r1'}) );
			assert.ok( ! op.matches({'a': 'z1'}) );
			debugger;
			assert.ok( ! op.matches({'a': 'a1'}) );
			assert.ok( ! op.matches({'a':'r'}) );
			}

		}
}

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);

