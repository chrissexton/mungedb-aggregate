"use strict";
var assert = require("assert"),
	MatchExpressionParser = require("../../../../lib/pipeline/matcher/MatchExpressionParser");


module.exports = {
	"MatchExpressionParser": {
		"Should generate matchers that work with no operators": function (){
			var goodQ = {'x':2},badQ = {'x':3};
			var parser =  new MatchExpressionParser();
			var res = parser.parse(goodQ);
			assert.strictEqual(res['code'], 'OK');
			assert.ok( res['result'].matches(goodQ));
			assert.ok( ! res['result'].matches(badQ));
		},
		"Should parse {x:5,y:{$gt:5, :$lt:8}}": function() {
			var q = {'x':5, 'y':{'$gt':5, '$lt':8}};
			var parser = new MatchExpressionParser();
			var res = parser.parse( q );
			assert.strictEqual(res.code, 'OK');
			assert.ok( res.result.matches({'x':5, 'y':7}) );
			assert.ok( res.result.matches({'x':5, 'y':6}) );
			assert.ok( ! res.result.matches({'x':6, 'y':7}) );
			assert.ok( ! res.result.matches({'x':5, 'y':9}) );
			assert.ok( ! res.result.matches({'x':5, 'y':4}) );
		},
		"Should parse $isolated and $atomic appropriately": function() {
			var q1 = {'x':5, '$atomic': {'$gt':5, '$lt':8}},
				q2 = {'x':5, '$isolated':1},
				q3 = {'x':5, 'y':{'$isolated':1}};
			var parser = new MatchExpressionParser();
			var t = parser.parse(q1);
			debugger;
			assert.strictEqual(parser.parse(q1).code, 'OK');
			assert.strictEqual(parser.parse(q2).code, 'OK');
			assert.strictEqual(parser.parse(q3).code, 'BAD_VALUE');
		}
	}
}

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);

