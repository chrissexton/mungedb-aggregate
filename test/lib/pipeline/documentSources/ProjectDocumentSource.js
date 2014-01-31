"use strict";
var assert = require("assert"),
	DocumentSource = require("../../../../lib/pipeline/documentSources/DocumentSource"),
	ProjectDocumentSource = require("../../../../lib/pipeline/documentSources/ProjectDocumentSource"),
	CursorDocumentSource = require("../../../../lib/pipeline/documentSources/CursorDocumentSource"),
	Cursor = require("../../../../lib/Cursor");


//HELPERS
var assertExhausted = function assertExhausted(pds) {
	assert.ok(pds.eof());
	assert.ok(!pds.advance());
};

/**
 *   Tests if the given rep is the same as what the pds resolves to as JSON.
 *   MUST CALL WITH A PDS AS THIS (e.g. checkJsonRepresentation.call(this, rep) where this is a PDS)
 **/
var checkJsonRepresentation = function checkJsonRepresentation(self, rep) {
	var pdsRep = {};
	self.sourceToJson(pdsRep, true);
	assert.deepEqual(pdsRep, rep);
};

var createProject = function createProject(projection) {
	//let projection be optional
	if (!projection) {
		projection = {
			a: true
		};
	}
	var spec = {
		"$project": projection
	},
		specElement = projection,
		project = ProjectDocumentSource.createFromJson(specElement);
	checkJsonRepresentation(project, spec);
	return project;
};


//TESTS
module.exports = {

	"ProjectDocumentSource": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor() {
				assert.doesNotThrow(function() {
					new ProjectDocumentSource();
				});
			}

		},

		"#getSourceName()": {

			"should return the correct source name; $project": function testSourceName() {
				var pds = new ProjectDocumentSource();
				assert.strictEqual(pds.getSourceName(), "$project");
			}

		},

		"#returnNext()": {

			"should return EOF": function testEOF() {
				var pds = createProject();
				pds.setSource({
					getNext: function getNext() {
						return DocumentSource.EOF;
					}
				});
				pds.getNext(function(err, doc) {
					assert.equal(DocumentSource.EOF, doc);
				});
			},

			"callback is required": function requireCallback() {
				var pds = createProject();
				pds.setSource({
					getNext: function getNext() {
						return false;
					}
				});
				assert.deepEqual(pds.getNext(/*no callback */), new Error('ProjectDocumentSource #getNext() requires callback'));
			}

			// "should return !eof == true when a document is still in cursor": function testNotEOFTrueIfDocPresent() {
			//     var cwc = new CursorDocumentSource.CursorWithContext();
			//     cwc._cursor = new Cursor( [{a: 1}] );
			//     var cds = new CursorDocumentSource(cwc);
			//     var pds = new ProjectDocumentSource();
			//     pds.setSource(cds);
			//     assert.ok(!pds.eof());
			// }

		},

		// "#advance()": {

		//     "should return same as this.psource.advance": function testCallsThisPSourceAdvance() {
		//         var pds = new ProjectDocumentSource();
		//         pds.setSource({
		//             advance: function advance() {
		//                 return true;
		//             }
		//         });
		//         assert.ok(pds.advance());
		//     },

		//     "can retrieve values from the project when advance is first function call": function testAdvanceFirst() {
		//         var cwc = new CursorDocumentSource.CursorWithContext();
		//         var input = [{_id: 0, a: 1}, {_id: 1, a: 2}];
		//         cwc._cursor = new Cursor( input );
		//         var cds = new CursorDocumentSource(cwc);
		//         var pds = createProject();
		//         pds.setSource(cds);
		//         assert.ok(pds.advance()); 
		//         assert.equal(2, pds.getCurrent().a);
		//     }

		// },

		/* TODO : copy mongo tests, they will probably be more involved */
		// "#getCurrent()": {

		//     "should work when getCurrent is the first function call": function getCurrentCalledFirst() {
		//         var cwc = new CursorDocumentSource.CursorWithContext();
		//         var input = [{_id: 0, a: 1}];
		//         cwc._cursor = new Cursor( input );
		//         var cds = new CursorDocumentSource(cwc);
		//         var pds = createProject();
		//         pds.setSource(cds);
		//         assert.ok(pds.getCurrent()); 
		//         assert.equal(1, pds.getCurrent().a);                
		//     }

		// },

		"combined": {

			"The a and c.d fields are included but the b field is not": function testFullProject1() {
				var cwc = new CursorDocumentSource.CursorWithContext();
				var input = [{
					_id: 0,
					a: 1,
					b: 1,
					c: {
						d: 1
					}
				}];
				cwc._cursor = new Cursor(input);
				var cds = new CursorDocumentSource(cwc);
				var pds = createProject({
					a: true,
					c: {
						d: true
					}
				});
				pds.setSource(cds);
				assert.ok(pds.getNext());
				assert.equal(1, pds.getCurrent().a);
				assert.ok(!pds.getCurrent().b);
				assert.equal(0, pds.getCurrent()._id);
				assert.equal(1, pds.getCurrent().c.d);
			},

			"Two documents": function testTwoDocumentsProject() {
				var cwc = new CursorDocumentSource.CursorWithContext();
				var input = [{
					a: 1,
					b: 2
				}, {
					a: 3,
					b: 4
				}];
				cwc._cursor = new Cursor(input);
				var cds = new CursorDocumentSource(cwc);
				var pds = createProject({
					a: true,
					c: {
						d: true
					}
				});
				pds.setSource(cds);
				assert.ok(!pds.eof());
				assert.equal(1, pds.getCurrent().a);
				assert.ok(!pds.getCurrent().b);
				assert.ok(pds.advance());
				assert.ok(!pds.eof());
				assert.equal(3, pds.getCurrent().a);
				assert.ok(!pds.getCurrent().b);
				assert.ok(!pds.advance());
				assertExhausted(pds);
			}
		},

		"#optimize()": {

			"Optimize the projection": function optimizeProject() {
				var pds = createProject({
					a: {
						$and: [true]
					}
				});
				pds.optimize();
				checkJsonRepresentation(pds, {
					$project: {
						a: {
							$const: true
						}
					}
				});
			}

		},

		"#createFromJson()": {

			"should error if called with non-object": function testNonObjectPassed() {
				//String as arg
				assert.throws(function() {
					var pds = createProject("not an object");
				});
				//Date as arg
				assert.throws(function() {
					var pds = createProject(new Date());
				});
				//Array as arg
				assert.throws(function() {
					var pds = createProject([]);
				});
				//Empty args
				assert.throws(function() {
					var pds = ProjectDocumentSource.createFromJson();
				});
				//Top level operator
				assert.throws(function() {
					var pds = createProject({
						$add: []
					});
				});
				//Invalid spec
				assert.throws(function() {
					var pds = createProject({
						a: {
							$invalidOperator: 1
						}
					});
				});

			}

		},

		"#getDependencies()": {

			"should properly detect dependencies in project": function testGetDependencies() {
				var cwc = new CursorDocumentSource.CursorWithContext();
				var input = {
					a: true,
					x: '$b',
					y: {
						$and: ['$c', '$d']
					}
				};
				var pds = createProject(input);
				var dependencies = {};
				assert.equal(DocumentSource.GetDepsReturn.EXHAUSTIVE, pds.getDependencies(dependencies));
				assert.equal(5, Object.keys(dependencies).length);
				assert.ok(dependencies._id);
				assert.ok(dependencies.a);
				assert.ok(dependencies.b);
				assert.ok(dependencies.c);
				assert.ok(dependencies.d);
			}

		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);