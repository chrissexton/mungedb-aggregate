"use strict";
var assert = require("assert"),
	TypeMatchExpression = require("../../../../lib/pipeline/matcher/TypeMatchExpression");


module.exports = {
	"TypeMatchExpression": {
		"should match string type": function (){
			
		},
		"should match null type": function() {
			
		},
		"should match unknown type": function() {
		
		},
		"should match bool type": function() {
		
		},
		"should match number type": function() {
		
		},
		"should match array  type": function() {
		
		},
		"should match null type more": function() {
		
		},
		"should match and preserve elemMatchKey": function() {
		
		},
		"should be equivalent": function() {
		
		}

	}
};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);

