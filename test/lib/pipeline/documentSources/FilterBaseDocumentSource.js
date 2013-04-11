"use strict";
var assert = require("assert"),
	FilterBaseDocumentSource = require("../../../../lib/pipeline/documentSources/FilterBaseDocumentSource");


/**
 * none of the rest of this class can be tested, since all the methods depend on 
 * accept, which is not implemented.
 *
 **/
module.exports = {

	"FilterBaseDocumentSource": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new FilterBaseDocumentSource();
				});
			}

		},

		"#accept()": {

			"should throw Error when calling accept": function testConstructor(){
				assert.throws(function(){
					var fbds = new FilterBaseDocumentSource();
					fbds.accept();
				});
			}

		},

		"#toMatcherJson()": {

			"should throw Error when calling toMatcherJson": function testConstructor(){
				assert.throws(function(){
					var fbds = new FilterBaseDocumentSource();
					fbds.toMatcherJson();
				});
			}

		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
