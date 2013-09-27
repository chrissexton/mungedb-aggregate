"use strict";
var assert = require("assert"),
	EqualityMatchExpression = require("../../../../lib/pipeline/matcher/EqualityMatchExpression");


module.exports = {
	"EqualityMatchExpression": {
		"should initialize equality and match numbers or numbers in arrays": function (){
			var e = new EqualityMatchExpression();
			var s = e.init('x',5);
			assert.strictEqual(s.code, 'OK');
			
			assert.ok( e.matches({'x':5}) );
			assert.ok( e.matches({'x':[5]}));	
			assert.ok( e.matches({'x':[1,5]}));	
			assert.ok( e.matches({'x':[1,5,2]}));
			assert.ok( e.matches({'x':[5,2]}) );
			
			assert.ok( ! e.matches({'x': null}) );
			assert.ok( ! e.matches({'x':6 }) );
			assert.ok( ! e.matches({'x':[4,2]}) );	
			assert.ok( ! e.matches({'x':[[5]]}) );	
		}
	}
};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);

