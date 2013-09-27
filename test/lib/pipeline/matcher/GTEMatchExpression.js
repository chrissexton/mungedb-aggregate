"use strict";
var assert = require("assert"),
	GTEMatchExpression = require("../../../../lib/pipeline/matcher/GTEMatchExpression");


module.exports = {
	"GTEMatchExpression": {
		"should match scalars and strings properly": function (){
			var e = new GTEMatchExpression();
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

