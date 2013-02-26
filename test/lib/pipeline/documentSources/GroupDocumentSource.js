var assert = require("assert"),
	CursorDocumentSource = require("../../../../lib/pipeline/documentSources/CursorDocumentSource"),
	Cursor = require("../../../../lib/Cursor"),
	GroupDocumentSource = require("../../../../lib/pipeline/documentSources/GroupDocumentSource");


/// An assertion for `ObjectExpression` instances based on Mongo's `ExpectedResultBase` class
function assertExpectedResult(args) {
	{// check for required args
		if (args === undefined) throw new TypeError("missing arg: `args` is required");
		if (args.spec && args.throw === undefined) args.throw = true; // Assume that spec only tests expect an error to be thrown 
		//if (args.spec === undefined) throw new Error("missing arg: `args.spec` is required");
		if (args.expected !== undefined && args.docs === undefined) throw new Error("must provide docs with expected value");
	}// check for required args

	// run implementation
	if(args.expected && args.docs){
		var gds = GroupDocumentSource.createFromJson(args.spec),
			cwc = new CursorDocumentSource.CursorWithContext();
		cwc._cursor = new Cursor( args.docs );
		var cds = new CursorDocumentSource(cwc);
		gds.setSource(cds);
		var result = gds.getCurrent();
		assert.deepEqual(result, args.expected);
	}else{
		if(args.throw)
			assert.throws(function(){
				GroupDocumentSource.createFromJson(args.spec);
			});
		else
			assert.doesNotThrow(function(){
				GroupDocumentSource.createFromJson(args.spec);
			});
	}

}

module.exports = {

	"GroupDocumentSource": {

		"constructor()": {

			// $group spec is not an object. g
			"should throw Error when constructing without args": function testConstructor(){
				assertExpectedResult({throw:true});
			},

			// $group spec is not an object. g
			"should throw Error when $group spec is not an object": function testConstructor(){
				assertExpectedResult({spec:"Foo"});
			},

			// $group spec is an empty object. g
			"should throw Error when $group spec is an empty object": function testConstructor(){
				assertExpectedResult({spec:{}});
			},

			// $group _id is an empty object. g
			"should not throw when _id is an empty object": function advanceTest(){
				assertExpectedResult({spec:{_id:{}}, throw:false});
			},

			// $group _id is specified as an invalid object expression. g
			"should throw error when  _id is an invalid object expression": function testConstructor(){
				assertExpectedResult({
					spec:{_id:{$add:1, $and:1}},
				});	
			},


			// $group with two _id specs. g
			//NOT Implemented can't do this in Javascript



			// $group _id is the empty string. g
			"should not throw when _id is an empty string": function advanceTest(){
				assertExpectedResult({spec:{_id:""}, throw:false});
			},

			// $group _id is a string constant. g
			"should not throw when _id is a string constant": function advanceTest(){
				assertExpectedResult({spec:{_id:"abc"}, throw:false});
			},

			// $group with _id set to an invalid field path. g
			"should throw when _id is an invalid field path": function advanceTest(){
				assertExpectedResult({spec:{_id:"$a.."}});
			},
		
			// $group _id is a numeric constant. g
			"should not throw when _id is a numeric constant": function advanceTest(){
				assertExpectedResult({spec:{_id:2}, throw:false});
			},

			// $group _id is an array constant. g
			"should not throw when _id is an array constant": function advanceTest(){
				assertExpectedResult({spec:{_id:[1,2]}, throw:false});
			},

			// $group _id is a regular expression (not supported). g
			"should throw when _id is a regex": function advanceTest(){
				assertExpectedResult({spec:{_id:/a/}});
			},

			// The name of an aggregate field is specified with a $ prefix. g
			"should throw when aggregate field spec is specified with $ prefix": function advanceTest(){
				assertExpectedResult({spec:{_id:1, $foo:{$sum:1}}});
			},

			// An aggregate field spec that is not an object. g
			"should throw when aggregate field spec is not an object": function advanceTest(){
				assertExpectedResult({spec:{_id:1, a:1}});
			},

			// An aggregate field spec that is not an object. g
			"should throw when aggregate field spec is an empty object": function advanceTest(){
				assertExpectedResult({spec:{_id:1, a:{}}});
			},

			// An aggregate field spec with an invalid accumulator operator. g
			"should throw when aggregate field spec is an invalid accumulator": function advanceTest(){
				assertExpectedResult({spec:{_id:1, a:{$bad:1}}});
			},

			// An aggregate field spec with an array argument. g
			"should throw when aggregate field spec with an array as an argument": function advanceTest(){
				assertExpectedResult({spec:{_id:1, a:{$sum:[]}}});
			},

			// Multiple accumulator operators for a field. g
			"should throw when aggregate field spec with multiple accumulators": function advanceTest(){
				assertExpectedResult({spec:{_id:1, a:{$sum:1, $push:1}}});
			}

			//Not Implementing, not way to support this in Javascript Objects
			// Aggregation using duplicate field names is allowed currently. g



		},

		"#getSourceName()": {

			"should return the correct source name; $group": function testSourceName(){
				var gds = new GroupDocumentSource({_id:{}});
				assert.strictEqual(gds.getSourceName(), "$group");
			}
		},

		"#advance": {

			// $group _id is computed from an object expression. g
			"should compute _id from an object expression": function advanceTest(){
				assertExpectedResult({
					docs:[{a:6}],
					spec:{_id:{z:"$a"}},
					expected:{_id:{z:6}}
				});
			},

			// $group _id is a field path expression. g
			"should compute _id a field path expression": function advanceTest(){
				assertExpectedResult({
					docs:[{a:5}],
					spec:{_id:"$a"},
					expected:{_id:5}
				});
			},

			// Aggregate the value of an object expression. g
			"should aggregate the value of an object expression": function advanceTest(){
				assertExpectedResult({
					docs:[{a:6}],
					spec:{_id:0, z:{$first:{x:"$a"}}},
					expected:{_id:0, z:{x:6}}
				});
			},

//			// Aggregate the value of an operator expression. g
			"should aggregate the value of an operator expression": function advanceTest(){
				assertExpectedResult({
					docs:[{a:6}],
					spec:{_id:0, z:{$first:"$a"}},
					expected:{_id:0, z:6}
				});
			}
		}
	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);


