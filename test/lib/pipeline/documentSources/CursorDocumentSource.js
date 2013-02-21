var assert = require("assert"),
	CursorDocumentSource = require("../../../../lib/pipeline/documentsources/CursorDocumentSource"),
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

		"#eof": {
			"should return true if the cursor is empty": function(){
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [] );
				
				var cds = new CursorDocumentSource(cwc);
				
				assert.equal(cds.eof(), true);
			},
			"should return false if the cursor is non-empty": function(){
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [1,2,3] );
				
				var cds = new CursorDocumentSource(cwc);
				
				assert.equal(cds.eof(), false);
			}
		},
		"#advance": {
			"should return true if the cursor was advanced": function(){
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [1,2,3] );
				
				var cds = new CursorDocumentSource(cwc);
				
				assert.equal(cds.advance(), true);
			},
			"should return false if the cursor is empty": function(){
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [1,2,3] );
				
				var cds = new CursorDocumentSource(cwc);
				cds.advance();cds.advance();cds.advance();
				assert.equal(cds.advance(), false);
			}
		},
		"#getCurrent": {
			"should return the current cursor value": function(){
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [1,2,3,4] );
				
				var cds = new CursorDocumentSource(cwc);
				assert.equal(cds.getCurrent(), 1);
				cds.advance();
				assert.equal(cds.getCurrent(), 2);
				cds.advance();
				assert.equal(cds.getCurrent(), 3);
				cds.advance();
				assert.equal(cds.getCurrent(), 4);
				cds.advance();
				assert.equal(cds.getCurrent(), undefined);
			}
		},
		"#dispose": {
			"should empty the current cursor": function(){
				var cwc = new CursorDocumentSource.CursorWithContext();
				cwc._cursor = new Cursor( [1,2,3] );
				
				var cds = new CursorDocumentSource(cwc);
				assert.equal(cds.getCurrent(), 1);
				cds.advance();
				assert.equal(cds.getCurrent(), 2);
				
				cds.dispose();
				assert.equal(cds.advance(), false);
				assert.equal(cds.eof(), true);
			}
		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run();