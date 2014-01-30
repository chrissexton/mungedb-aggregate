"use strict";
var assert = require("assert"),
	DocumentSource = require("../../../../lib/pipeline/documentSources/DocumentSource"),
	LimitDocumentSource = require("../../../../lib/pipeline/documentSources/LimitDocumentSource");


module.exports = {

	"LimitDocumentSource": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new LimitDocumentSource();
				});
			}

		},

		"#getSourceName()": {

			"should return the correct source name; $limit": function testSourceName(){
				var lds = new LimitDocumentSource();
				assert.strictEqual(lds.getSourceName(), "$limit");
			}

		},

		"#getFactory()": {

			"should return the constructor for this class": function factoryIsConstructor(){
				assert.strictEqual(new LimitDocumentSource().getFactory(), LimitDocumentSource);
			}

		},

		"#coalesce()": {

			"should return false if nextSource is not $limit": function dontSkip(){
				var lds = new LimitDocumentSource();
				assert.equal(lds.coalesce({}), false);
			},
			"should return true if nextSource is $limit": function changeLimit(){
				var lds = new LimitDocumentSource();
				assert.equal(lds.coalesce(new LimitDocumentSource()), true);
			}

		},

		"#getNext()": {

			"should return the current document source": function currSource(next){
				var lds = new LimitDocumentSource();
				lds.limit = 1;
				lds.source = {getNext:function(cb){cb({ item:1 });}};
				lds.getNext(function(val) {
					assert.deepEqual(val, { item:1 });
					next();
				});
			},

			"should return EOF for no sources remaining": function noMoar(next){
				var lds = new LimitDocumentSource();
				lds.limit = 10;
				lds.source = {
					calls: 0,
					getNext:function(cb) {
						if (lds.source.calls)
							return cb(DocumentSource.EOF);
						lds.source.calls++;
						return cb({item:1});
					},
					dispose:function() { return true; }
				};
				lds.getNext(function(){});
				lds.getNext(function(val) {
					assert.strictEqual(val, DocumentSource.EOF);
					next();
				});
			},

			"should return false if we hit our limit": function noMoar(next){
				var lds = new LimitDocumentSource();
				lds.limit = 1;
				lds.source = {
					calls: 0,
					getNext:function(cb) {
						if (lds.source.calls)
							return cb(DocumentSource.EOF);
						return cb({item:1});
					},
					dispose:function() { return true; }
				};
				lds.getNext(function(){});
				lds.getNext(function (val) {
					assert.strictEqual(val, DocumentSource.EOF);
					next();
				});
			}

		},

		"#sourceToJson()": {

			"should create an object with a key $limit and the value equal to the limit": function sourceToJsonTest(){
				var lds = new LimitDocumentSource();
				lds.limit = 9;
				var t = {};
				lds.sourceToJson(t, false);
				assert.deepEqual(t, { "$limit": 9 });
			}

		},

		"#createFromJson()": {

			"should return a new LimitDocumentSource object from an input number": function createTest(){
				var t = LimitDocumentSource.createFromJson(5);
				assert.strictEqual(t.constructor, LimitDocumentSource);
				assert.strictEqual(t.limit, 5);
			}

		}


	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
