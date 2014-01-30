"use strict";
var assert = require("assert"),
	DocumentSource = require("../../../../lib/pipeline/documentSources/DocumentSource");


module.exports = {

	"DocumentSource": {

		"depsToProjection": {
			"should be able to convert dependencies to a projection": function(){
				var array = {'a':1,'b':1},
					expected = '{"_id":0,"a":1,"b":1}',
					proj = DocumentSource.depsToProjection(array);

				assert.equal(expected, JSON.stringify(proj));
			},
		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run();

