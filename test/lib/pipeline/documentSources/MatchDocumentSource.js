"use strict";
var assert = require("assert"),
	MatchDocumentSource = require("../../../../lib/pipeline/documentSources/MatchDocumentSource");


module.exports = {

	"MatchDocumentSource": {

		"constructor()": {

			"should throw Error when constructing without args": function testConstructor(){
				assert.throws(function(){
					new MatchDocumentSource();
				});
			}

		},

		"#getSourceName()": {

			"should return the correct source name; $match": function testSourceName(){
				var mds = new MatchDocumentSource({ packet :{ $exists : false } });
				assert.strictEqual(mds.getSourceName(), "$match");
			}

		},

		"#accept()": {

			"should return true on the input document": function acceptTest(){
				var mds = new MatchDocumentSource({ location : { $in : ['Kentucky'] } });
				assert.strictEqual(mds.accept({ name: 'Adam', location: 'Kentucky'}), true);
			}

		},

		"#sourceToJson()": {

			"should append the match query to the input builder": function sourceToJsonTest(){
				var mds = new MatchDocumentSource({ location : { $in : ['Kentucky'] } });
				var t = {};
				mds.sourceToJson(t, false);
				assert.deepEqual(t, { "$match" : { location : { $in : ['Kentucky'] } }});
			}

		},

		"#toMatcherJson()": {

			"should append the match query to an object suitable for creating a new matcher": function convertTest(){
				var mds = new MatchDocumentSource({ location : { $in : ['Kentucky'] } });
				var t = {};
				mds.toMatcherJson(t);
				assert.deepEqual(t, { location : { $in : ['Kentucky'] } });
			}


		},

		"#createFromJson()": {

			"should return a new MatchDocumentSource object from an input object": function createTest(){
				var t = MatchDocumentSource.createFromJson({ someval:{$exists:true} });
				assert.strictEqual(t instanceof MatchDocumentSource, true);
			}

		},

        "#getDependencies()": {

            "should properly detect dependencies in match": function testGetDependencies(){
				var t = MatchDocumentSource.createFromJson({ someval:{$exists:true} });
                var dependencies = {};
                assert.equal("SEE_NEXT", t.getDependencies(dependencies));
                assert.equal(1, Object.keys(dependencies).length);
                assert.ok(dependencies.someval);
            }

        }


	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
