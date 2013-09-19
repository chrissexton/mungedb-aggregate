"use strict";
var assert = require("assert"),
	ComparisonMatchExpression = require("../../../../lib/pipeline/matcher/ComparisonMatchExpression");


module.exports = {
	"ComparisonMatchExpression": {
		"Should properly initialize with an empty path and a number": function (){
			var e = new ComparisonMatchExpression();
			e._matchType = 'LT';
			assert.strictEqual(e.init('', 5 )['code'],'OK');
		},
		"Should not initialize when given an undefined rhs": function() {
			var e = new ComparisonMatchExpression();
			assert.strictEqual(e.init('',5)['code'],'BAD_VALUE');
			e._matchType = 'LT';
			assert.strictEqual(e.init('',{})['code'],'BAD_VALUE');	
			assert.strictEqual(e.init('',undefined)['code'],'BAD_VALUE');
			assert.strictEqual(e.init('',{})['code'],'BAD_VALUE');
			}
		}
};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);

