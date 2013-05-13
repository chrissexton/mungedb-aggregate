"use strict";
var assert = require("assert"),
	SortDocumentSource = require("../../../../lib/pipeline/documentSources/SortDocumentSource"),
	CursorDocumentSource = require("../../../../lib/pipeline/documentSources/CursorDocumentSource"),
	Cursor = require("../../../../lib/Cursor"),
	FieldPathExpression = require("../../../../lib/pipeline/expressions/FieldPathExpression");


module.exports = {

	"SortDocumentSource": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new SortDocumentSource();
				});
			}

		},

		"#getSourceName()": {

			"should return the correct source name; $sort": function testSourceName(){
				var sds = new SortDocumentSource();
				assert.strictEqual(sds.getSourceName(), "$sort");
			}

		},

		"#getFactory()": {

			"should return the constructor for this class": function factoryIsConstructor(){
				assert.strictEqual(new SortDocumentSource().getFactory(), SortDocumentSource);
			}

		},

		"#eof()": {

			"should return true if there are no more sources": function noSources(){
				var sds = new SortDocumentSource();
				sds.pSource = {
					eof: function(){
						return true;
					}
				};
				assert.equal(sds.eof(), true);
			},
			"should return false if there are more documents": function hitSort(){
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [{a: 1}] );
				var cds = new CursorDocumentSource(cwc);
				var sds = new SortDocumentSource();
				sds.setSource(cds);
				assert.equal(sds.eof(), false);
			}

		},

		"#getCurrent()": {

			"should return the current document source": function currSource(){
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [{a: 1}] );
				var cds = new CursorDocumentSource(cwc);
				var sds = new SortDocumentSource();
				sds.setSource(cds);
				assert.deepEqual(sds.getCurrent(), { a:1 }); 
			}

		},

		"#advance()": {

			"should return true for moving to the next source": function nextSource(){
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [{a: 1}, {b:2}] );
				var cds = new CursorDocumentSource(cwc);
				var sds = new SortDocumentSource();
				sds.setSource(cds);
				assert.strictEqual(sds.advance(), true); 
			},

			"should return false for no sources remaining": function noMoar(){
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [{a: 1}, {b:2}] );
				var cds = new CursorDocumentSource(cwc);
				var sds = new SortDocumentSource();
				sds.setSource(cds);
				sds.advance();
				assert.strictEqual(sds.advance(), false); 
			}

		},

		"#sourceToJson()": {

			"should create an object representation of the SortDocumentSource": function sourceToJsonTest(){
				var sds = new SortDocumentSource();
				sds.vSortKey.push(new FieldPathExpression("b") );
				var t = {};
				sds.sourceToJson(t, false);
				assert.deepEqual(t, { "$sort": { "b": -1 } });
			}

		},

		"#createFromJson()": {

			"should return a new SortDocumentSource object from an input JSON object": function createTest(){
				var sds = SortDocumentSource.createFromJson({a:1});
				assert.strictEqual(sds.constructor, SortDocumentSource);
				var t = {};
				sds.sourceToJson(t, false);
				assert.deepEqual(t, { "$sort": { "a": 1 } });
			},

			"should return a new SortDocumentSource object from an input JSON object with a descending field": function createTest(){
				var sds = SortDocumentSource.createFromJson({a:-1});
				assert.strictEqual(sds.constructor, SortDocumentSource);
				var t = {};
				sds.sourceToJson(t, false);
				assert.deepEqual(t, { "$sort": { "a": -1 } });
			},

			"should return a new SortDocumentSource object from an input JSON object with dotted paths": function createTest(){
				var sds = SortDocumentSource.createFromJson({ "a.b":1 });
				assert.strictEqual(sds.constructor, SortDocumentSource);
				var t = {};
				sds.sourceToJson(t, false);
				assert.deepEqual(t, { "$sort": { "a.b" : 1  } });
			},

			"should throw an exception when not passed an object": function createTest(){
				assert.throws(function() {
					var sds = SortDocumentSource.createFromJson(7);
				});
			},

			"should throw an exception when passed an empty object": function createTest(){
				assert.throws(function() {
					var sds = SortDocumentSource.createFromJson({});
				});
			},

			"should throw an exception when passed an object with a non number value": function createTest(){
				assert.throws(function() {
					var sds = SortDocumentSource.createFromJson({a:"b"});
				});
			},

			"should throw an exception when passed an object with a non valid number value": function createTest(){
				assert.throws(function() {
					var sds = SortDocumentSource.createFromJson({a:14});
				});
			}

		},

		"#sort": {

			"should sort a single document": function singleValue() {
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [{_id:0, a: 1}] );
				var cds = new CursorDocumentSource(cwc);
				var sds = new SortDocumentSource();
				sds.addKey("_id", false);
				sds.setSource(cds);
				assert.deepEqual(sds.getCurrent(), {_id:0, a:1}); 
			},

			"should sort two documents": function twoValue() {
				var cwc = new CursorDocumentSource.CursorWithContext();
				var l = [{_id:0, a: 1}, {_id:1, a:0}];
				cwc._cursor = new Cursor( l );
				var cds = new CursorDocumentSource(cwc);
				var sds = new SortDocumentSource();
				sds.addKey("_id", false);
				sds.setSource(cds);
				var c = [];
				while (!sds.eof()) {
					c.push(sds.getCurrent());
					sds.advance();
				}
				assert.deepEqual(c, [{_id:1, a: 0}, {_id:0, a:1}]); 
			},

			"should sort two documents in ascending order": function ascendingValue() {
				var cwc = new CursorDocumentSource.CursorWithContext();
				var l = [{_id:0, a: 1}, {_id:5, a:12}, {_id:1, a:0}];
				cwc._cursor = new Cursor( l );
				var cds = new CursorDocumentSource(cwc);
				var sds = new SortDocumentSource();
				sds.addKey("_id", true);
				sds.setSource(cds);
				var c = [];
				while (!sds.eof()) {
					c.push(sds.getCurrent());
					sds.advance();
				}
				assert.deepEqual(c, [{_id:0, a: 1}, {_id:1, a:0}, {_id:5, a:12}]); 
			},

			"should sort documents with a compound key": function compoundKeySort() {
				var cwc = new CursorDocumentSource.CursorWithContext();
				var l = [{_id:0, a: 1, b:3}, {_id:5, a:12, b:7}, {_id:1, a:0, b:2}];
				cwc._cursor = new Cursor( l );
				var cds = new CursorDocumentSource(cwc);
				var sds = new SortDocumentSource();
				sds.addKey("a", false);
				sds.addKey("b", false);
				sds.setSource(cds);
				var c = [];
				while (!sds.eof()) {
					c.push(sds.getCurrent());
					sds.advance();
				}
				assert.deepEqual(c, [{_id:5, a:12, b:7}, {_id:0, a:1, b:3}, {_id:1, a:0, b:2}]); 
			},

			"should sort documents with a compound key in ascending order": function compoundAscendingKeySort() {
				var cwc = new CursorDocumentSource.CursorWithContext();
				var l = [{_id:0, a: 1, b:3}, {_id:5, a:12, b:7}, {_id:1, a:0, b:2}];
				cwc._cursor = new Cursor( l );
				var cds = new CursorDocumentSource(cwc);
				var sds = new SortDocumentSource();
				sds.addKey("a", true);
				sds.addKey("b", true);
				sds.setSource(cds);
				var c = [];
				while (!sds.eof()) {
					c.push(sds.getCurrent());
					sds.advance();
				}
				assert.deepEqual(c, [{_id:1, a:0, b:2}, {_id:0, a:1, b:3}, {_id:5, a:12, b:7}]); 
			},

			"should sort documents with a compound key in mixed order": function compoundMixedKeySort() {
				var cwc = new CursorDocumentSource.CursorWithContext();
				var l = [{_id:0, a: 1, b:3}, {_id:5, a:12, b:7}, {_id:1, a:0, b:2}, {_id:8, a:7, b:42}];
				cwc._cursor = new Cursor( l );
				var cds = new CursorDocumentSource(cwc);
				var sds = new SortDocumentSource();
				sds.addKey("a", true);
				sds.addKey("b", false);
				sds.setSource(cds);
				var c = [];
				while (!sds.eof()) {
					c.push(sds.getCurrent());
					sds.advance();
				}
				assert.deepEqual(c, [{_id:1, a:0, b:2}, {_id:0, a:1, b:3}, {_id:8, a:7, b:42}, {_id:5, a:12, b:7}]); 
			},

			"should not sort different types": function diffTypesSort() {
				var cwc = new CursorDocumentSource.CursorWithContext();
				var l = [{_id:0, a: 1}, {_id:1, a:"foo"}];
				cwc._cursor = new Cursor( l );
				var cds = new CursorDocumentSource(cwc);
				var sds = new SortDocumentSource();
				sds.addKey("a", false);
				assert.throws(sds.setSource(cds));
			},

			"should sort docs with missing fields": function missingFields() {
				var cwc = new CursorDocumentSource.CursorWithContext();
				var l = [{_id:0, a: 1}, {_id:1}];
				cwc._cursor = new Cursor( l );
				var cds = new CursorDocumentSource(cwc);
				var sds = new SortDocumentSource();
				sds.addKey("a", true);
				sds.setSource(cds);
				var c = [];
				while (!sds.eof()) {
					c.push(sds.getCurrent());
					sds.advance();
				}
				assert.deepEqual(c, [{_id:1}, {_id:0, a:1}]); 
			},

			"should sort docs with null fields": function nullFields() {
				var cwc = new CursorDocumentSource.CursorWithContext();
				var l = [{_id:0, a: 1}, {_id:1, a: null}];
				cwc._cursor = new Cursor( l );
				var cds = new CursorDocumentSource(cwc);
				var sds = new SortDocumentSource();
				sds.addKey("a", true);
				sds.setSource(cds);
				var c = [];
				while (!sds.eof()) {
					c.push(sds.getCurrent());
					sds.advance();
				}
				assert.deepEqual(c, [{_id:1, a:null}, {_id:0, a:1}]); 
			},

			"should not support a missing object nested in an array": function missingObjectWithinArray() {
				var cwc = new CursorDocumentSource.CursorWithContext();
				var l = [{_id:0, a: [1]}, {_id:1, a:[0]}];
				cwc._cursor = new Cursor( l );
				var cds = new CursorDocumentSource(cwc);
				var sds = new SortDocumentSource();
				assert.throws(function() {
					sds.addKey("a.b", false);
					sds.setSource(cds);
					var c = [];
					while (!sds.eof()) {
						c.push(sds.getCurrent());
						sds.advance();
					}
				});
			},

			"should compare nested values from within an array": function extractArrayValues() {
				var cwc = new CursorDocumentSource.CursorWithContext();
				var l = [{_id:0,a:[{b:1},{b:2}]}, {_id:1,a:[{b:1},{b:1}]} ];
				cwc._cursor = new Cursor( l );
				var cds = new CursorDocumentSource(cwc);
				var sds = new SortDocumentSource();
				sds.addKey("a.b", true);
				sds.setSource(cds);
				var c = [];
				while (!sds.eof()) {
					c.push(sds.getCurrent());
					sds.advance();
				}
				assert.deepEqual(c, [{_id:1,a:[{b:1},{b:1}]},{_id:0,a:[{b:1},{b:2}]}]); 
			}

		},

		"#dependencies": {
			"should have Dependant field paths": function dependencies() {
				var sds = new SortDocumentSource();
				sds.addKey("a", true);
				sds.addKey("b.c", false);
				var deps = {};
				assert.equal("SEE_NEXT", sds.getDependencies(deps));
				assert.equal(2, Object.keys(deps).length);
				assert.ok(deps.a);
				assert.ok(deps["b.c"]);
			}
		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
