"use strict";
var assert = require("assert"),
	SkipDocumentSource = require("../../../../lib/pipeline/documentSources/SkipDocumentSource");


module.exports = {

	"SkipDocumentSource": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new SkipDocumentSource();
				});
			}

		},

		"#getSourceName()": {

			"should return the correct source name; $skip": function testSourceName(){
				var lds = new SkipDocumentSource();
				assert.strictEqual(lds.getSourceName(), "$skip");
			}

		},

		"#coalesce()": {

			"should return false if nextSource is not $skip": function dontSkip(){
				var lds = new SkipDocumentSource();
				assert.equal(lds.coalesce({}), false);
			},
			"should return true if nextSource is $skip": function changeSkip(){
				var lds = new SkipDocumentSource();
				assert.equal(lds.coalesce(new SkipDocumentSource()), true);
			}

		},

		"#eof()": {

			"should return true if there are no more sources": function noSources(){
				var lds = new SkipDocumentSource();
				lds.skip = 9;
				lds.count = 0;
				lds.pSource = {
					eof: function(){
						return true;
					}
				};
				assert.equal(lds.eof(), true);
			},
			"should return false if skip count is not hit and there are more documents": function hitSkip(){
				var lds = new SkipDocumentSource();
				lds.skip = 10;
				lds.count = 9;
				
				var i = 1;
				lds.pSource = {
					getCurrent:function(){return { item:i };},
					eof: function(){return false;},
					advance: function(){i++; return true;}
				};
				assert.equal(lds.eof(), false);
			}

		},

		"#getCurrent()": {

			"should return the current document source": function currSource(){
				var lds = new SkipDocumentSource();
				lds.skip = 1;
				
				var i = 0;
				lds.pSource = {
					getCurrent:function(){return { item:i };},
					eof: function(){return false;},
					advance: function(){i++; return true;}
				};
				assert.deepEqual(lds.getCurrent(), { item:1 });
			}

		},

		"#advance()": {

			"should return true for moving to the next source": function nextSource(){
				var lds = new SkipDocumentSource();
				lds.skip = 1;
				
				var i = 0;
				lds.pSource = {
					getCurrent:function(){return { item:i };},
					eof: function(){return false;},
					advance: function(){i++; return true;}
				};
				assert.strictEqual(lds.advance(), true);
			},

			"should return false for no sources remaining": function noMoar(){
				var lds = new SkipDocumentSource();
				lds.skip = 1;
				
				var i = 0;
				lds.pSource = {
					getCurrent:function(){return { item:i };},
					eof: function(){return true;},
					advance: function(){return false;}
				};
				assert.strictEqual(lds.advance(), false);
			},

			"should return false if we hit our limit": function noMoar(){
				var lds = new SkipDocumentSource();
				lds.skip = 3;
				
				var i = 0;
				lds.pSource = {
					getCurrent:function(){return { item:i };},
					eof: function(){return i>=5;},
					advance: function(){i++; return i<5;}
				};
				assert.strictEqual(lds.advance(), true);
				assert.strictEqual(lds.advance(), false);
			}

		},

		"#sourceToJson()": {

			"should create an object with a key $skip and the value equal to the skip": function sourceToJsonTest(){
				var lds = new SkipDocumentSource();
				lds.skip = 9;
				var t = {};
				lds.sourceToJson(t, false);
				assert.deepEqual(t, { "$skip": 9 });
			}

		},

		"#createFromJson()": {

			"should return a new SkipDocumentSource object from an input number": function createTest(){
				var t = SkipDocumentSource.createFromJson(5);
				assert.strictEqual(t.constructor, SkipDocumentSource);
				assert.strictEqual(t.skip, 5);
			}

		}


	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
