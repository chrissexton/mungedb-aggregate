"use strict";
var assert = require("assert"),
	SplitDocumentSource = require("../../../../lib/pipeline/documentSources/SplitDocumentSource"),
	CursorDocumentSource = require("../../../../lib/pipeline/documentSources/CursorDocumentSource"),
	Cursor = require("../../../../lib/Cursor");


module.exports = {

	"SplitDocumentSource": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new SplitDocumentSource();
				});
			},

			"should throw an error if called with arguments.length > 0": function throwsWithArgs(){
				assert.throws(function(){
					new SplitDocumentSource(1);
				});
			}

		},

		"#getSourceName()": {

			"should return the correct source name; $split": function testSourceName(){
				var pds = new SplitDocumentSource();
				assert.strictEqual(pds.getSourceName(), SplitDocumentSource.splitName);
			}

		},

		"#eof()": {

			"shouldn't be eof after init": function testEOF(){
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [{a: 1}] );
				var cds = new CursorDocumentSource(cwc);
				var split = new SplitDocumentSource();
				split.setSource(cds);
				assert.ok(!split.eof());
			},

			"should be eof after one call to get current": function testAdvanceFirst() {
				var cwc = new CursorDocumentSource.CursorWithContext();
				var input = [{_id: 0, a: 1}, {_id: 1, a: 2}];
				cwc._cursor = new Cursor( input );
				var cds = new CursorDocumentSource(cwc);
				var split = new SplitDocumentSource();
				split.setSource(cds);
				assert.ok(split.getCurrent()); 
				assert.ok(split.eof);
			}

		},

		"#advance()": {

			"can't advance after one call to getCurrent": function testAdvanceFirst() {
				var cwc = new CursorDocumentSource.CursorWithContext();
				var input = [{_id: 0, a: 1}, {_id: 1, a: 2}];
				cwc._cursor = new Cursor( input );
				var cds = new CursorDocumentSource(cwc);
				var split = new SplitDocumentSource();
				split.setSource(cds);
				assert.ok(split.getCurrent()); 
				assert.ok(!split.advance());
			},

			"throws exception if advanced beyond eof": function throwsBeyondEof() {
				assert.throws(function() {
					var cwc = new CursorDocumentSource.CursorWithContext();
					var input = [{_id: 0, a: 1}, {_id: 1, a: 2}];
					cwc._cursor = new Cursor( input );
					var cds = new CursorDocumentSource(cwc);
					var split = new SplitDocumentSource();
					split.setSource(cds);
					split.getCurrent(); 
					split.advance();
					split.advance();
				});
			}
		},

		"#populate()": function testPopulate() {
			var spec = {
				aX2:[{$project:{a:{$multiply:["$a", 2]}}}],
				aX3:[{$project:{a:{$multiply:["$a", 3]}}}]
			};
				
			var cwc = new CursorDocumentSource.CursorWithContext();
			var input = [{a:1}, {a:2}];
			cwc._cursor = new Cursor( input );
			var cds = new CursorDocumentSource(cwc);
			var split = SplitDocumentSource.createFromJson(spec);
			split.setSource(cds);
			
			assert.ok(!split.eof());
			assert.deepEqual({aX2:[{a:2}, {a:4}], aX3:[{a:3}, {a:6}]}, split.getCurrent());
			/*
			assert.ok(!split.getCurrent().b);
			assert.ok(split.advance());
			assert.ok(!split.eof());
			assert.equal(3, split.getCurret().a); 
			assert.ok(!split.getCurrent().b);
			assert.ok(!split.advance());
			assertExhausted(split);
			*/
		},

		"#createFromJson()": {

			"should error if called with non-object": function testNonObjectPassed() {
				//String as arg
				assert.throws(function() {
					var split = SplitDocumentSource.createFromJson("not an object");
				});
				//Date as arg
				assert.throws(function() {
					var split = SplitDocumentSource.createFromJson(new Date());
				});
				//Array as arg
				assert.throws(function() {
					var split = SplitDocumentSource.createFromJson([]);
				});
				//Empty args
				assert.throws(function() {
					var split = SplitDocumentSource.createFromJson();
				});
			},

			"should error if spec has no keys": function testNoKeys() {
				assert.throws(function() {
					var split = SplitDocumentSource.createFromJson({});
				});
			},

			"should error if value of a key in top level is not an array": function testNoKeys() {
				assert.throws(function() {
					var split = SplitDocumentSource.createFromJson({a: "not an array"});
				});
			}

		},

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
