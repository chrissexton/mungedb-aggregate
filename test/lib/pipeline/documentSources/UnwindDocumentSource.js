"use strict";
var assert = require("assert"),
	DocumentSource = require("../../../../lib/pipeline/documentSources/DocumentSource"),
	UnwindDocumentSource = require("../../../../lib/pipeline/documentSources/UnwindDocumentSource"),
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

var createUnwind = function createUnwind(unwind) {
    //let unwind be optional
    if(!unwind){
        unwind = "$a";
    }
    var spec = {"$unwind": unwind},
        specElement = unwind,
		unwindDs = UnwindDocumentSource.createFromJson(specElement);
    checkJsonRepresentation(unwindDs, spec);
    return unwindDs;
};

var addSource = function addSource(unwind, data) {
    var cwc = new CursorDocumentSource.CursorWithContext();
    cwc._cursor = new Cursor( data );
    var cds = new CursorDocumentSource(cwc);
    var pds = new UnwindDocumentSource();
    unwind.setSource(cds);
};

var checkResults = function checkResults(data, expectedResults, path){
	var unwind = createUnwind(path);
	addSource(unwind, data || []);
	
	expectedResults = expectedResults || [];
	
	var resultSet = [];
    while( !unwind.eof() ) {

        // If not eof, current is non null.
        assert.ok( unwind.getCurrent() );

        // Get the current result.
        resultSet.push( unwind.getCurrent() );

        // Advance.
        if ( unwind.advance() ) {
            // If advance succeeded, eof() is false.
            assert.equal( unwind.eof(), false );
        }
    }
    assert.deepEqual( resultSet, expectedResults );
};

var throwsException = function throwsException(data, path, expectedResults){
	assert.throws(function(){
		checkResults(data, path, expectedResults);
	});
};


//TESTS
module.exports = {

    "UnwindDocumentSource": {

        "constructor()": {

            "should throw Error when constructing with args": function (){
                assert.throws(function(){
                    new UnwindDocumentSource("$a");
                });
            }

        },

        "#getSourceName()": {

            "should return the correct source name; $unwind": function (){
                var pds = new UnwindDocumentSource();
                assert.strictEqual(pds.getSourceName(), "$unwind");
            }

        },

        "#eof()": {

            "should return true if source is empty": function (){
                var pds = createUnwind();
                addSource(pds, []);
                assert.strictEqual(pds.eof(), true);
            },
            
            "should return false if source documents exist": function (){
                var pds = createUnwind();
                addSource(pds, [{_id:0, a:[1]}]);
                assert.strictEqual(pds.eof(), false);
            }

        },

        "#advance()": {

            "should return false if there are no documents in the parent source": function () {
                var pds = createUnwind();
                addSource(pds, []);
                assert.strictEqual(pds.advance(), false);
            },
            "should return true if source documents exist and advance the source": function (){
                var pds = createUnwind();
                addSource(pds, [{_id:0, a:[1,2]}]);
                assert.strictEqual(pds.advance(), true);
                assert.strictEqual(pds.getCurrent().a, 2);
            }
        },

        "#getCurrent()": {

            "should return null if there are no documents in the parent source": function () {
                var pds = createUnwind();
                addSource(pds, []);
                assert.strictEqual(pds.getCurrent(), null);
            },
            "should return unwound documents": function (){
                var pds = createUnwind();
                addSource(pds, [{_id:0, a:[1,2]}]);
                assert.ok(pds.getCurrent());
                assert.strictEqual(pds.getCurrent().a, 1);
            },
            
            "A document without the unwind field produces no results.": function(){
				checkResults([{}]);
            },
            "A document with a null field produces no results.": function(){
				checkResults([{a:null}]);
            },
            "A document with an empty array produces no results.": function(){
				checkResults([{a:[]}]);
            },
            "A document with a number field produces a UserException.": function(){
				throwsException([{a:1}]);
            },
            "An additional document with a number field produces a UserException.": function(){
				throwsException([{a:[1]}, {a:1}]);
            },
            "A document with a string field produces a UserException.": function(){
				throwsException([{a:"foo"}]);
            },
            "A document with an object field produces a UserException.": function(){
				throwsException([{a:{}}]);
            },
            "Unwind an array with one value.": function(){
				checkResults(
					[{_id:0, a:[1]}],
					[{_id:0,a:1}]
				);
            },
            "Unwind an array with two values.": function(){
				checkResults(
					[{_id:0, a:[1, 2]}],
					[{_id:0,a:1}, {_id:0,a:2}]
				);
            },
            "Unwind an array with two values, one of which is null.": function(){
				checkResults(
					[{_id:0, a:[1, null]}],
					[{_id:0,a:1}, {_id:0,a:null}]
				);
            },
            "Unwind two documents with arrays.": function(){
				checkResults(
					[{_id:0, a:[1,2]}, {_id:0, a:[3,4]}],
					[{_id:0,a:1}, {_id:0,a:2}, {_id:0,a:3}, {_id:0,a:4}]
				);
            },
            "Unwind an array in a nested document.": function(){
				checkResults(
					[{_id:0,a:{b:[1,2],c:3}}],
					[{_id:0,a:{b:1,c:3}},{_id:0,a:{b:2,c:3}}],
					"$a.b"
				);
            },
            "A missing array (that cannot be nested below a non object field) produces no results.": function(){
				checkResults(
					[{_id:0,a:4}],
					[],
					"$a.b"
				);
            },
            "Unwind an array in a doubly nested document.": function(){
				checkResults(
					[{_id:0,a:{b:{d:[1,2],e:4},c:3}}],
					[{_id:0,a:{b:{d:1,e:4},c:3}},{_id:0,a:{b:{d:2,e:4},c:3}}],
					"$a.b.d"
				);
            },
            "Unwind several documents in a row.": function(){
				checkResults(
					[
						{_id:0,a:[1,2,3]},
						{_id:1},
						{_id:2},
						{_id:3,a:[10,20]},
						{_id:4,a:[30]}
					],
					[
						{_id:0,a:1},
						{_id:0,a:2},
						{_id:0,a:3},
						{_id:3,a:10},
                        {_id:3,a:20},
                        {_id:4,a:30}
                    ]
				);
            },
            "Unwind several more documents in a row.": function(){
				checkResults(
					[
						{_id:0,a:null},
						{_id:1},
						{_id:2,a:['a','b']},
						{_id:3},
						{_id:4,a:[1,2,3]},
						{_id:5,a:[4,5,6]},
						{_id:6,a:[7,8,9]},
						{_id:7,a:[]}
					],
					[
						{_id:2,a:'a'},
						{_id:2,a:'b'},
						{_id:4,a:1},
						{_id:4,a:2},
                        {_id:4,a:3},
                        {_id:5,a:4},
                        {_id:5,a:5},
                        {_id:5,a:6},
                        {_id:6,a:7},
                        {_id:6,a:8},
                        {_id:6,a:9}
					]
				);
            }
            
        },

        "#createFromJson()": {

            "should error if called with non-string": function testNonObjectPassed() {
                //Date as arg
                assert.throws(function() {
                    var pds = createUnwind(new Date());
                });
                //Array as arg
                assert.throws(function() {
                    var pds = createUnwind([]);
                });
                //Empty args
                assert.throws(function() {
                    var pds = UnwindDocumentSource.createFromJson();
                });
                //Top level operator
                assert.throws(function() {
                    var pds = createUnwind({$add: []});
                });

            }

        },
        "#getDependencies": {
			"should Dependant field paths.": function () {
                var pds = createUnwind("$x.y.z"),
					deps = {};
                assert.strictEqual(pds.getDependencies(deps), DocumentSource.GetDepsReturn.SEE_NEXT);
                assert.deepEqual(deps, {"x.y.z":1});
                
			}
        }

    }

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
