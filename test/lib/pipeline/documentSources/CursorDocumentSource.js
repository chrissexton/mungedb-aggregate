"use strict";
var assert = require("assert"),
	async = require("async"),
	CursorDocumentSource = require("../../../../lib/pipeline/documentSources/CursorDocumentSource"),
	LimitDocumentSource = require("../../../../lib/pipeline/documentSources/LimitDocumentSource"),
	SkipDocumentSource = require("../../../../lib/pipeline/documentSources/SkipDocumentSource"),
	Cursor = require("../../../../lib/Cursor");


module.exports = {

	"CursorDocumentSource": {

		"constructor(data)": {
			"should fail if CursorWithContext is not provided": function(){
				assert.throws(function(){
					var cds = new CursorDocumentSource();
				});
			},
			"should get a accept a CursorWithContext and set it internally": function(){
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [] );

				var cds = new CursorDocumentSource(cwc);

				assert.ok(cds._cursorWithContext);
			}
		},

		"#coalesce": {
			"should be able to coalesce a limit into itself": function (){
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [] );

				var lds = new LimitDocumentSource();
				lds.limit = 1;

				var cds = new CursorDocumentSource(cwc);
				assert.equal(cds.coalesce(lds) instanceof LimitDocumentSource, true);
			},
			"should leave non-limit alone": function () {
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [] );

				var sds = new SkipDocumentSource(),
					cds = new CursorDocumentSource(cwc);

				assert.equal(cds.coalesce(sds), false);
			}
		},

		"#getNext": {
			"should return the current cursor value sync": function(){
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [1,2,3,4] );

				var cds = new CursorDocumentSource(cwc);
				assert.equal(cds.getNext(), 1);
				assert.equal(cds.getNext(), 2);
				assert.equal(cds.getNext(), 3);
				assert.equal(cds.getNext(), 4);
				assert.equal(cds.getNext(), undefined);
			},
			"should return the current cursor value async": function(next){
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [1,2,3,4] );

				var cds = new CursorDocumentSource(cwc);
				cds.getNext(function(val) {
					assert.equal(val, 1);
					cds.getNext(function(val) {
						assert.equal(val, 2);
						cds.getNext(function(val) {
							assert.equal(val, 3);
							cds.getNext(function(val) {
								assert.equal(val, 4);
								cds.getNext(function(val) {
									assert.equal(val, undefined);
									return next();
								});
							});
						});
					});
				});
			},
			"should return values past the batch limit": function(){
				var cwc = new CursorDocumentSource.CursorWithContext(),
					n = 0,
					arr = Array.apply(0, new Array(200)).map(function() { return n++; });
				cwc._cursor = new Cursor( arr );

				var cds = new CursorDocumentSource(cwc);
				arr.forEach(function(v) {
					assert.equal(cds.getNext(), v);
				});
				assert.equal(cds.getNext(), undefined);
			},
		},
		"#dispose": {
			"should empty the current cursor": function(){
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [1,2,3] );

				var cds = new CursorDocumentSource(cwc);
				assert.equal(cds.getNext(), 1);
				assert.equal(cds.getNext(), 2);

				cds.dispose();
				assert.equal(cds.getNext(), undefined);
			}
		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run();
