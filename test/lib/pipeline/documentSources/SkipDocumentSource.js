"use strict";
var assert = require("assert"),
	async = require("async"),
	Cursor = require("../../../../lib/Cursor"),
	DocumentSource = require("../../../../lib/pipeline/documentSources/DocumentSource"),
	CursorDocumentSource = require("../../../../lib/pipeline/documentSources/CursorDocumentSource"),
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

		"#getNext()": {

			"should return EOF if there are no more sources": function noSources(next){
				var lds = new SkipDocumentSource();
				lds.skip = 3;
				lds.count = 0;

				var expected = [
					{val:4},
					DocumentSource.EOF
				];

                var cwc = new CursorDocumentSource.CursorWithContext();
                var input = [
					{val:1},
					{val:2},
					{val:3},
					{val:4},
				];
                cwc._cursor = new Cursor( input );
                var cds = new CursorDocumentSource(cwc);
				lds.setSource(cds);

				async.series([
						lds.getNext.bind(lds),
						lds.getNext.bind(lds),
					],
					function(err,res) {
						assert.deepEqual(expected, res);
						next();
					}
				);
				lds.getNext(function(err, actual) {
					assert.equal(actual, DocumentSource.EOF);
				});
			},
			"should return documents if skip count is not hit and there are more documents": function hitSkip(next){
				var lds = SkipDocumentSource.createFromJson(1);

                var cwc = new CursorDocumentSource.CursorWithContext();
                var input = [{val:1},{val:2},{val:3}];
                cwc._cursor = new Cursor( input );
                var cds = new CursorDocumentSource(cwc);
				lds.setSource(cds);

				lds.getNext(function(err,actual) {
					assert.notEqual(actual, DocumentSource.EOF);
					assert.deepEqual(actual, {val:2});
					next();
				});
			},

			"should return the current document source": function currSource(){
				var lds = SkipDocumentSource.createFromJson(1);

                var cwc = new CursorDocumentSource.CursorWithContext();
                var input = [{val:1},{val:2},{val:3}];
                cwc._cursor = new Cursor( input );
                var cds = new CursorDocumentSource(cwc);
				lds.setSource(cds);

				lds.getNext(function(err, actual) {
					assert.deepEqual(actual, { val:2 });
				});
			},

			"should return false if we hit our limit": function noMoar(next){
				var lds = new SkipDocumentSource();
				lds.skip = 3;

				var expected = [
					{item:4},
					DocumentSource.EOF
				];

				var i = 1;
				lds.source = {
					getNext:function(cb){
						if (i>=5)
							return cb(null,DocumentSource.EOF);
						return cb(null, { item:i++ });
					}
				};

				async.series([
						lds.getNext.bind(lds),
						lds.getNext.bind(lds),
					],
					function(err,res) {
						assert.deepEqual(expected, res);
						next();
					}
				);
			}

		},

		"#serialize()": {

			"should create an object with a key $skip and the value equal to the skip": function sourceToJsonTest(){
				var lds = new SkipDocumentSource();
				lds.skip = 9;
				var t = lds.serialize(false);
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
