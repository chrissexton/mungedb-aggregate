"use strict";
var assert = require("assert"),
	LTEMatchExpression = require("../../../../lib/pipeline/matcher/LTEMatchExpression");


module.exports = {
	"LTEMatchExpression": {
		"should match scalars and strings properly": function (){
			var e = new LTEMatchExpression();
			var s = e.init('x',5);
			
			assert.strictEqual(s.code, 'OK');
			assert.ok( e.matches({'x':5}) );
			assert.ok( ! e.matches({'x':4}) );
			assert.ok( e.matches({'x':6}) );
			assert.ok( ! e.matches({'x': 'eliot'}) );
		}
	}
};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);

