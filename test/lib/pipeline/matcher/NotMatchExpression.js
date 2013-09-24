"use strict";
var assert = require("assert"),
	NotMatchExpression = require("../../../../lib/pipeline/matcher/NotMatchExpression"),
	LTMatchExpression = require("../../../../lib/pipeline/matcher/LTMatchExpression"), 
	GTMatchExpression = require("../../../../lib/pipeline/matcher/GTMatchExpression");	

module.exports = {
	"NotMatchExpression": {
		"Should match a scalar": function (){
			var lt = new LTMatchExpression();
			assert.strictEqual(lt.init('a', 5)['code'],'OK');
			var op = new NotMatchExpression();
			assert.strictEqual( op.init(lt)['code'], 'OK');
			assert.ok( op.matches({'a':6}), '{$not: {$lt: 5}}, {a:6}' );
			assert.ok( !op.matches({'a':4}), '{$not: {$lt: 5}}, {a:4}' );
		},
		"Should match an Array": function() {
			var lt = new LTMatchExpression();
			assert.strictEqual(lt.init('a',5)['code'],'OK');
			var op = new NotMatchExpression();
			assert.strictEqual(op.init(lt)['code'],'OK');
			assert.ok( op.matches({'a': [6]}) , '{$not: {$lt: 5}}, {a: [6]}');	
			assert.ok( !op.matches({'a': [4]}) , '{$not: {$lt: 5}}, {a: [4]}');	
			assert.ok( !op.matches({'a': [4,5,6]}) , '{$not: {$lt: 5}}, {a: [4,5,6]}');
			}
		}
};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);

