"use strict";
var assert = require("assert"),
	OrMatchExpression = require("../../../../lib/pipeline/matcher/OrMatchExpression"),
	GTEMatchExpression = require("../../../../lib/pipeline/matcher/GTEMatchExpression");


module.exports = {
	"OrMatchExpression": {
		"Should not match with 0 clauses": function (){
			var op = new OrMatchExpression();
			assert.ok( ! op.matches(5, '{$or: []}, 5'));
		},
		"Should match with a single matching clause": function() {
			var op = new OrMatchExpression();
			var gt = new GTEMatchExpression();
			gt.init('', 5);
			op.add(gt);
			assert.ok( op.matches(6) , '{$or: [{$gte: 5}]}, 6');
			}
		}
}

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);

