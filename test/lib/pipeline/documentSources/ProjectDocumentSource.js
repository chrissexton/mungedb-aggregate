
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
    if(!projection){
        projection = {a:true};
    }
    var spec = {"$project": projection},
        specElement = projection,
        project = ProjectDocumentSource.createFromJson(specElement);
    checkJsonRepresentation(project, spec);
    return project;
};

//TESTS
module.exports = {

    "ProjectDocumentSource": {

        "constructor()": {

            "should throw Error when constructing with args": function testConstructor(){
                assert.throws(function(){
                    new ProjectDocumentSource({ctx: [1,2]});
                });
            }

        },

        "#getSourceName()": {

            "should return the correct source name; $project": function testSourceName(){
                var pds = new ProjectDocumentSource();
                assert.strictEqual(pds.getSourceName(), "$project");
            }

        },

        "#eof()": {

            "should return same as this.pSource.eof": function testEOF(){
                var pds = new ProjectDocumentSource();
                pds.setSource({
                    eof: function eof() {
                        return true;
                    }
                });
                assert.ok(pds.eof());
            },

            "should return !eof == true when a document is still in cursor": function testNotEOFTrueIfDocPresent() {
                var cwc = new CursorDocumentSource.CursorWithContext();
                cwc._cursor = new Cursor( [{a: 1}] );
                var cds = new CursorDocumentSource(cwc);
                var pds = new ProjectDocumentSource();
                pds.setSource(cds);
                assert.ok(!pds.eof());
            }

        },

        "#advance()": {

            "should return same as this.psource.advance": function testCallsThisPSourceAdvance() {
                var pds = new ProjectDocumentSource();
                pds.setSource({
                    advance: function advance() {
                        return true;
                    }
                });
                assert.ok(pds.advance());
            },

            /*
            "can retrieve values from the project when advance is first function call": function testAdvanceFirst() {
                var cwc = new CursorDocumentSource.CursorWithContext();
                var input = [{_id: 0, a: 1}, {_id: 1, a: 2}];
                cwc._cursor = new Cursor( input );
                var cds = new CursorDocumentSource(cwc);
                var pds = createProject();
                pds.setSource(cds);
                assert.ok(pds.advance()); 
                assert.equal(2, pds.getCurrent().a);
            }
            */

        },

        /* TODO : copy mongo tests, they will probably be more involved */
        "#getCurrent()": {

            /*
            "should work when getCurrent is the first function call": function getCurrentCalledFirst() {
                var cwc = new CursorDocumentSource.CursorWithContext();
                var input = [{_id: 0, a: 1}];
                cwc._cursor = new Cursor( input );
                var cds = new CursorDocumentSource(cwc);
                var pds = createProject();
                pds.setSource(cds);
                assert.ok(pds.getCurrent()); 
                assert.equal(1, pds.getCurrent().a);                
            }
            */

        },

        "combined": {

            /*
            "The a and c.d fields are included but the b field is not": function testFullProject1() {
                var cwc = new CursorDocumentSource.CursorWithContext();
                var input = [{_id:0,a:1,b:1,c:{d:1}}];
                cwc._cursor = new Cursor( input );
                var cds = new CursorDocumentSource(cwc);
                var pds = createProject({a:true, c:{d:true}});
                pds.setSource(cds);
                assert.ok(pds.getCurrent()); 
                assert.equal(1, pds.getCurrent().a);  
                assert.ok(!pds.getCurrent().b);
                assert.equal(0, pds.getCurrent()._id);
                assert.equal(1, pds.getCurrent().c.d);
            },

            "Two documents": function testTwoDocumentsProject() {
                var cwc = new CursorDocumentSource.CursorWithContext();
                var input = [{a:1, b:2}, {a:3, b:4}];
                cwc._cursor = new Cursor( input );
                var cds = new CursorDocumentSource(cwc);
                var pds = createProject({a:true, c:{d:true}});
                pds.setSource(cds);
                assert.ok(!pds.eof());
                assert.equal(1, pds.getCurrent().a);  
                assert.ok(!pds.getCurrent().b);
                assert.equal(0, pds.getCurrent()._id);
                assert.equal(1, pds.getCurrent().c.d); 
                assert.ok(pds.advance());
                assert.ok(!pds.eof());
                assert.equal(3, pds.getCurrent().a); 
                assert.ok(!pds.getCurrent().b);
                assert.ok(!project.advance());
                assertExhausted(pds);
            }
            */
        },

        "#optimize()": {
            
            /*
            "Optimize the projection": function optimizeProject() {
                var pds = createProject({a:{$and: [true]}});
                pds.optimize();
                checkJsonRepresentation(pds, {$project:{a:{$const:true}}});
            }
            */

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
                    pds = ProjectDocumentSource.createFromJson();
                });
                //Top level operator
                assert.throws(function() {
                    var pds = createProject({$add: []});
                });
                //Invalid spec
                assert.throws(function() {
                    var pds = createProject({a:{$invalidOperator:1}});
                });

            }

        },

        "#getDependencies()": {

            /*
            "should return a new ProjectDocumentSource object from an input object": function createTest(){
                var cwc = new CursorDocumentSource.CursorWithContext();
                var input = [{a:true,x:'$b',y:{$and:['$c','$d']}}];
                var pds = createProject(input);
                var dependencies = {};
                assert.equals(DocumentSource.GetDepsReturn.EXHAUSTIVE, pds.getDependencies(dependencies));
                assert.equals(5, dependencies.length);
                assert.ok(dependencies._id);
                assert.ok(dependencies.a);
                assert.ok(dependencies.b);
                assert.ok(dependencies.c);
                assert.ok(dependencies.d);
            }
            */

        }

    }

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
