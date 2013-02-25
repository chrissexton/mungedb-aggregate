var assert = require("assert"),
	ObjectExpression = require("../../../../lib/pipeline/expressions/ObjectExpression"),
	ConstantExpression = require("../../../../lib/pipeline/expressions/ConstantExpression"),
	FieldPathExpression = require("../../../../lib/pipeline/expressions/FieldPathExpression"),
	AndExpression = require("../../../../lib/pipeline/expressions/AndExpression");


function assertEqualJson(actual, expected, message){
	assert.strictEqual(message + ":  " + JSON.stringify(actual), message + ":  " + JSON.stringify(expected));
}

/// An assertion for `ObjectExpression` instances based on Mongo's `ExpectedResultBase` class
function assertExpectedResult(args) {
	{// check for required args
		if (args === undefined) throw new TypeError("missing arg: `args` is required");
		if (!("expected" in args)) throw new Error("missing arg: `args.expected` is required");
		if (!("expectedDependencies" in args)) throw new Error("missing arg: `args.expectedDependencies` is required");
		if (!("expectedJsonRepresentation" in args)) throw new Error("missing arg: `args.expectedJsonRepresentation` is required");
	}// check for required args
	{// base args if none provided
		if (args.source === undefined) args.source = {_id:0, a:1, b:2};
		if (args.expectedIsSimple === undefined) args.expectedIsSimple = true;
		if (args.expression === undefined) args.expression = new ObjectExpression(); //NOTE: replaces prepareExpression + _expression assignment
	}// base args if none provided
	// run implementation
	var result = args.expression.addToDocument({}, args.source, args.source);
	assertEqualJson(result, args.expected, "unexpected results");
	var dependencies = args.expression.addDependencies([], [/*FAKING: includePath=true*/]);
	dependencies.sort(), args.expectedDependencies.sort();	// NOTE: this is a minor hack added for munge because I'm pretty sure order doesn't matter for this anyhow
	assertEqualJson(dependencies, args.expectedDependencies, "unexpected dependencies");
	assertEqualJson(args.expression.toJson(true), args.expectedJsonRepresentation, "unexpected JSON representation");
	assertEqualJson(args.expression.getIsSimple(), args.expectedIsSimple, "unexpected isSimple status");
}


module.exports = {

	"ObjectExpression": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new ObjectExpression();
				});
			},

		},

		"#addDependencies":{

			"should be able to get dependencies for non-inclusion expressions": function testNonInclusionDependencies(){
				/** Dependencies for non inclusion expressions. */
				var expr = new ObjectExpression();
				expr.addField("a", new ConstantExpression(5));
				assertEqualJson(expr.addDependencies([], [/*FAKING: includePath=true*/]), ["_id"], "unexpected dependencies (including _id)");
				assertEqualJson(expr.addDependencies([]), [], "unexpected dependencies (excluding _id)");
				expr.addField("b", new FieldPathExpression("c.d"));
				assertEqualJson(expr.addDependencies([], [/*FAKING: includePath=true*/]), ["c.d", "_id"], "unexpected dependencies (including _id)");
				assertEqualJson(expr.addDependencies([]), ["c.d"], "unexpected dependencies (excluding _id)");
			},

			"should be able to get dependencies for inclusion expressions": function testInclusionDependencies(){
				/** Dependencies for inclusion expressions. */
				var expr = new ObjectExpression();
				expr.includePath( "a" );
				assertEqualJson(expr.addDependencies([], [/*FAKING: includePath=true*/]), ["_id", "a"], "unexpected dependencies (including _id)");
				assert.throws(function(){
					expr.addDependencies([]);
				}, Error);
			},

		},

		"#toJson": {

			"should be able to convert to JSON representation and have constants represented by expressions": function testJson(){
				/** Serialize to a BSONObj, with constants represented by expressions. */
				var expr = new ObjectExpression();
				expr.addField("foo.a", new ConstantExpression(5));
				assertEqualJson({foo:{a:{$const:5}}}, expr.toJson(true));
			}

		},

		"#optimize": {

			"should be able to optimize expression and sub-expressions": function testOptimize(){
				/** Optimizing an object expression optimizes its sub expressions. */
				var expr = new ObjectExpression();
				// Add inclusion.
				expr.includePath( "a" );
				// Add non inclusion.
				expr.addField( "b", new AndExpression());
				expr.optimize();
				// Optimizing 'expression' optimizes its non inclusion sub expressions, while inclusion sub expressions are passed through.
				assertEqualJson({a:true, b:{$const:true}}, expr.toJson(true));
			},

		},

		"#evaluate()": {

			"should be able to provide an empty object": function testEmpty(){
				/** Empty object spec. */
				var expr = new ObjectExpression();
				assertExpectedResult({
					expression: expr,
					expected: {"_id":0},
					expectedDependencies: ["_id"],
					expectedJsonRepresentation: {},
				});
			},

			"should be able to include 'a' field only": function testInclude(){
				/** Include 'a' field only. */
				var expr = new ObjectExpression();
				expr.includePath( "a" );
				assertExpectedResult({
					expression: expr,
					expected: {"_id":0, "a":1},
					expectedDependencies: ["_id", "a"],
					expectedJsonRepresentation: {"a":true},
				});
			},

			"should NOT be able to include missing 'a' field": function testMissingInclude(){
				/** Cannot include missing 'a' field. */
				var expr = new ObjectExpression();
				expr.includePath( "a" );
				assertExpectedResult({
					source: {"_id":0, "b":2},
					expression: expr,
					expected: {"_id":0},
					expectedDependencies: ["_id", "a"],
					expectedJsonRepresentation: {"a":true},
				});
			},

			"should be able to include '_id' field only": function testIncludeId(){
				/** Include '_id' field only. */
				var expr = new ObjectExpression();
				expr.includePath( "_id" );
				assertExpectedResult({
					expression: expr,
					expected: {"_id":0},
					expectedDependencies: ["_id"],
					expectedJsonRepresentation: {"_id":true},
				});
			},

			"should be able to exclude '_id' field": function testExcludeId(){
				/** Exclude '_id' field. */
				var expr = new ObjectExpression();
				expr.includePath( "b" );
				expr.excludeId = true;
				assertExpectedResult({
					expression: expr,
					expected: {"b":2},
					expectedDependencies: ["b"],
					expectedJsonRepresentation: {"_id":false, "b":true},
				});
			},

			"should be able to include fields in source document order regardless of inclusion order": function testSourceOrder(){
				/** Result order based on source document field order, not inclusion spec field order. */
				var expr = new ObjectExpression();
				expr.includePath( "b" );
				expr.includePath( "a" );
				assertExpectedResult({
					expression: expr,
					get expected() { return this.source; },
					expectedDependencies: ["_id", "a", "b"],
					expectedJsonRepresentation: {"b":true, "a":true},
				});
			},

			"should be able to include a nested field": function testIncludeNested(){
				/** Include a nested field. */
				var expr = new ObjectExpression();
				expr.includePath( "a.b" );
				assertExpectedResult({
					source: {"_id":0, "a":{ "b":5, "c":6}, "z":2 },
					expression: expr,
					expected: {"_id":0, "a":{ "b":5} },
					expectedDependencies: ["_id", "a.b"],
					expectedJsonRepresentation: {"a":{ "b":true} },
				});
			},

			"should be able to include two nested fields": function testIncludeTwoNested(){
				/** Include two nested fields. */
				var expr = new ObjectExpression();
				expr.includePath( "a.b" );
				expr.includePath( "a.c" );
				assertExpectedResult({
					source: {"_id":0, "a":{ "b":5, "c":6}, "z":2 },
					expression: expr,
					expected: {"_id":0, "a":{ "b":5, "c":6} },
					expectedDependencies: ["_id", "a.b", "a.c"],
					expectedJsonRepresentation: {"a":{ "b":true, "c":true} },
				});
			},

			"should be able to include two fields nested within different parents": function testIncludeTwoParentNested(){
				/** Include two fields nested within different parents. */
				var expr = new ObjectExpression();
				expr.includePath( "a.b" );
				expr.includePath( "c.d" );
				assertExpectedResult({
					source: {"_id":0, "a":{ "b":5 }, "c":{"d":6} },
					expression: expr,
					expected: {"_id":0, "a":{ "b":5}, "c":{"d":6} },
					expectedDependencies: ["_id", "a.b", "c.d"],
					expectedJsonRepresentation: {"a":{"b":true}, "c":{"d":true} }
				});
			},

			"should be able to attempt to include a missing nested field": function testIncludeMissingNested(){
				/** Attempt to include a missing nested field. */
				var expr = new ObjectExpression();
				expr.includePath( "a.b" );
				assertExpectedResult({
					source: {"_id":0, "a":{ "c":6}, "z":2 },
					expression: expr,
					expected: {"_id":0, "a":{} },
					expectedDependencies: ["_id", "a.b"],
					expectedJsonRepresentation: {"a":{ "b":true} },
				});
			},

			"should be able to attempt to include a nested field within a non object": function testIncludeNestedWithinNonObject(){
				/** Attempt to include a nested field within a non object. */
				var expr = new ObjectExpression();
				expr.includePath( "a.b" );
				assertExpectedResult({
					source: {"_id":0, "a":2, "z":2},
					expression: expr,
					expected: {"_id":0},
					expectedDependencies: ["_id", "a.b"],
					expectedJsonRepresentation: {"a":{ "b":true} },
				});
			},

			"should be able to include a nested field within an array": function testIncludeArrayNested(){
				/** Include a nested field within an array. */
				var expr = new ObjectExpression();
				expr.includePath( "a.b" );
				assertExpectedResult({
					source: {_id:0,a:[{b:5,c:6},{b:2,c:9},{c:7},[],2],z:1},
					expression: expr,
					expected: {_id:0,a:[{b:5},{b:2},{}]},
					expectedDependencies: ["_id", "a.b"],
					expectedJsonRepresentation: {"a":{ "b":true} },
				});
			},

			"should NOT include non-root '_id' field implicitly": function testExcludeNonRootId(){
				/** Don't include not root '_id' field implicitly. */
				var expr = new ObjectExpression();
				expr.includePath( "a.b" );
				assertExpectedResult({
					source: {"_id":0, "a":{ "_id":1, "b":1} },
					expression: expr,
					expected: {"_id":0, "a":{ "b":1} },
					expectedDependencies: ["_id", "a.b"],
					expectedJsonRepresentation: {"a":{ "b":true} },
				});
			},

			"should be able to project a computed expression": function testComputed(){
				/** Project a computed expression. */
				var expr = new ObjectExpression();
				expr.addField("a", new ConstantExpression(5));
				assertExpectedResult({
					source: {"_id":0},
					expression: expr,
					expected: {"_id":0, "a":5},
					expectedDependencies: ["_id"],
					expectedJsonRepresentation: {"a":{ "$const":5} },
					expectedIsSimple: false
				});
			},

			"should be able to project a computed expression replacing an existing field": function testComputedReplacement(){
				/** Project a computed expression replacing an existing field. */
				var expr = new ObjectExpression();
				expr.addField("a", new ConstantExpression(5));
				assertExpectedResult({
					source: {"_id":0, "a":99},
					expression: expr,
					expected: {"_id": 0, "a": 5},
					expectedDependencies: ["_id"],
					expectedJsonRepresentation: {"a": {"$const": 5}},
					expectedIsSimple: false
				});
			},

			"should NOT be able to project an undefined value": function testComputedUndefined(){
				/** An undefined value is not projected.. */
				var expr = new ObjectExpression();
				expr.addField("a", new ConstantExpression(undefined));
				assertExpectedResult({
					source: {"_id":0},
					expression: expr,
					expected: {"_id":0},
					expectedDependencies: ["_id"],
					expectedJsonRepresentation: {a:{$const:undefined}},
					expectedIsSimple: false
				});
			},

			"should be able to project a computed expression replacing an existing field with Undefined": function testComputedUndefinedReplacement(){
				/** Project a computed expression replacing an existing field with Undefined. */
				var expr = new ObjectExpression();
				expr.addField("a", new ConstantExpression(5));
				assertExpectedResult({
					source: {"_id":0, "a":99},
					expression: expr,
					expected: {"_id":0, "a":5},
					expectedDependencies: ["_id"],
					expectedJsonRepresentation: {"a":{"$const":5}},
					expectedIsSimple: false
				});
			},

			"should be able to project a null value": function testComputedNull(){
				/** A null value is projected. */
				var expr = new ObjectExpression();
				expr.addField("a", new ConstantExpression(null));
				assertExpectedResult({
					source: {"_id":0},
					expression: expr,
					expected: {"_id":0, "a":null},
					expectedDependencies: ["_id"],
					expectedJsonRepresentation: {"a":{"$const":null}},
					expectedIsSimple: false
				});
			},

			"should be able to project a nested value": function testComputedNested(){
				/** A nested value is projected. */
				var expr = new ObjectExpression();
				expr.addField("a.b", new ConstantExpression(5));
				assertExpectedResult({
					source: {"_id":0},
					expression: expr,
					expected: {"_id":0, "a":{"b":5}},
					expectedDependencies: ["_id"],
					expectedJsonRepresentation: {"a":{"b":{"$const":5}}},
					expectedIsSimple: false
				});
			},

			"should be able to project a field path": function testComputedFieldPath(){
				/** A field path is projected. */
				var expr = new ObjectExpression();
				expr.addField("a", new FieldPathExpression("x"));
				assertExpectedResult({
					source: {"_id":0, "x":4},
					expression: expr,
					expected: {"_id":0, "a":4},
					expectedDependencies: ["_id", "x"],
					expectedJsonRepresentation: {"a":"$x"},
					expectedIsSimple: false
				});
			},

			"should be able to project a nested field path": function testComputedNestedFieldPath(){
				/** A nested field path is projected. */
				var expr = new ObjectExpression();
				expr.addField("a.b", new FieldPathExpression("x.y"));
				assertExpectedResult({
					source: {"_id":0, "x":{"y":4}},
					expression: expr,
					expected: {"_id":0, "a":{"b":4}},
					expectedDependencies: ["_id", "x.y"],
					expectedJsonRepresentation: {"a":{"b":"$x.y"}},
					expectedIsSimple: false
				});
			},

			"should NOT project an empty subobject expression for a missing field": function testEmptyNewSubobject(){
				/** An empty subobject expression for a missing field is not projected. */
				var expr = new ObjectExpression();
				// Create a sub expression returning an empty object.
				var subExpr = new ObjectExpression();
				subExpr.addField("b", new ConstantExpression(undefined));
				expr.addField( "a", subExpr );
				assertExpectedResult({
					source: {"_id":0},
					expression: expr,
					expected: {"_id":0},
					expectedDependencies: ["_id"],
					expectedJsonRepresentation: {a:{b:{$const:undefined}}},
					expectedIsSimple: false
				});
			},

			"should be able to project a non-empty new subobject": function testNonEmptyNewSubobject(){
				/** A non empty subobject expression for a missing field is projected. */
				var expr = new ObjectExpression();
				// Create a sub expression returning an empty object.
				var subExpr = new ObjectExpression();
				subExpr.addField("b", new ConstantExpression(6));
				expr.addField( "a", subExpr );
				assertExpectedResult({
					source: {"_id":0},
					expression: expr,
					expected: {"_id":0, "a":{ "b":6} },
					expectedDependencies: ["_id"],
					expectedJsonRepresentation: {a:{b:{$const:6}}},
					expectedIsSimple: false
				});
			},

			"should be able to project two computed fields within a common parent": function testAdjacentDottedComputedFields(){
				/** Two computed fields within a common parent. */
				var expr = new ObjectExpression();
				expr.addField("a.b", new ConstantExpression(6));
				expr.addField("a.c", new ConstantExpression(7));
				assertExpectedResult({
					source: {"_id":0},
					expression: expr,
					expected: {"_id":0, "a":{ "b":6, "c":7} },
					expectedDependencies: ["_id"],
					expectedJsonRepresentation: {a:{b:{$const:6},c:{$const:7}}},
					expectedIsSimple: false
				});
			},

			"should be able to project two computed fields within a common parent (w/ one case dotted)": function testAdjacentDottedAndNestedComputedFields(){
				/** Two computed fields within a common parent, in one case dotted. */
				var expr = new ObjectExpression();
				expr.addField("a.b", new ConstantExpression(6));
				var subExpr = new ObjectExpression();
				subExpr.addField("c", new ConstantExpression( 7 ) );
				expr.addField("a", subExpr);
				assertExpectedResult({
					source: {"_id":0},
					expression: expr,
					expected: {"_id":0, "a":{ "b":6, "c":7} },
					expectedDependencies: ["_id"],
					expectedJsonRepresentation: {a:{b:{$const:6},c:{$const:7}}},
					expectedIsSimple: false
				});
			},

			"should be able to project two computed fields within a common parent (in another case dotted)": function testAdjacentNestedAndDottedComputedFields(){
				/** Two computed fields within a common parent, in another case dotted. */
				var expr = new ObjectExpression();
				var subExpr = new ObjectExpression();
				subExpr.addField("b", new ConstantExpression(6));
				expr.addField("a", subExpr );
				expr.addField("a.c", new ConstantExpression(7));
				assertExpectedResult({
					source: {"_id":0},
					expression: expr,
					expected: {"_id":0, "a":{ "b":6, "c":7} },
					expectedDependencies: ["_id"],
					expectedJsonRepresentation: {a:{b:{$const:6},c:{$const:7}}},
					expectedIsSimple: false
				});
			},

			"should be able to project two computed fields within a common parent (nested rather than dotted)": function testAdjacentNestedComputedFields(){
				/** Two computed fields within a common parent, nested rather than dotted. */
				var expr = new ObjectExpression();
				var subExpr1 = new ObjectExpression();
				subExpr1.addField("b", new ConstantExpression(6));
				expr.addField("a", subExpr1);
				var subExpr2 = new ObjectExpression();
				subExpr2.addField("c", new ConstantExpression(7));
				expr.addField("a", subExpr2);
				assertExpectedResult({
					source: {"_id":0},
					expression: expr,
					expected: {"_id":0, "a":{ "b":6, "c":7} },
					expectedDependencies: ["_id"],
					expectedJsonRepresentation: {a:{b:{$const:6},c:{$const:7}}},
					expectedIsSimple: false
				});
			},

			"should be able to project multiple nested fields out of order without affecting output order": function testAdjacentNestedOrdering(){
				/** Field ordering is preserved when nested fields are merged. */
				var expr = new ObjectExpression();
				expr.addField("a.b", new ConstantExpression(6));
				var subExpr = new ObjectExpression();
				// Add field 'd' then 'c'.  Expect the same field ordering in the result doc.
				subExpr.addField("d", new ConstantExpression(7));
				subExpr.addField("c", new ConstantExpression(8));
				expr.addField("a", subExpr);
				assertExpectedResult({
					source: {"_id":0},
					expression: expr,
					expected: {"_id":0, "a":{ "b":6, "d":7, "c":8} },
					expectedDependencies: ["_id"],
					expectedJsonRepresentation: {a:{b:{$const:6},d:{$const:7},c:{$const:8}}},
					expectedIsSimple: false
				});
			},

			"should be able to project adjacent fields two levels deep": function testMultipleNestedFields(){
				/** Adjacent fields two levels deep. */
				var expr = new ObjectExpression();
				expr.addField("a.b.c", new ConstantExpression(6));
				var bSubExpression = new ObjectExpression();
				bSubExpression.addField("d", new ConstantExpression(7));
				var aSubExpression = new ObjectExpression();
				aSubExpression.addField("b", bSubExpression);
				expr.addField("a", aSubExpression);
				assertExpectedResult({
					source: {"_id":0},
					expression: expr,
					expected: {"_id":0, "a":{ "b":{ "c":6, "d":7}}},
					expectedDependencies: ["_id"],
					expectedJsonRepresentation: {a:{b:{c:{$const:6},d:{$const:7}}}},
					expectedIsSimple: false
				});
			},

			"should throw an Error if two expressions generate the same field": function testConflictingExpressionFields(){
				/** Two expressions cannot generate the same field. */
				var expr = new ObjectExpression();
				expr.addField("a", new ConstantExpression(5));
				assert.throws(function(){
					expr.addField("a", new ConstantExpression(6)); // Duplicate field.
				}, Error);
			},

			"should throw an Error if an expression field conflicts with an inclusion field": function testConflictingInclusionExpressionFields(){
				/** An expression field conflicts with an inclusion field. */
				var expr = new ObjectExpression();
				expr.includePath("a");
				assert.throws(function(){
					expr.addField("a", new ConstantExpression(6));
				}, Error);
			},

			"should throw an Error if an inclusion field conflicts with an expression field": function testConflictingExpressionInclusionFields(){
				/** An inclusion field conflicts with an expression field. */
				var expr = new ObjectExpression();
				expr.addField("a", new ConstantExpression(5));
				assert.throws(function(){
					expr.includePath("a");
				}, Error);
			},

			"should throw an Error if an object expression conflicts with a constant expression": function testConflictingObjectConstantExpressionFields(){
				/** An object expression conflicts with a constant expression. */
				var expr = new ObjectExpression();
				var subExpr = new ObjectExpression();
				subExpr.includePath("b");
				expr.addField("a", subExpr);
				assert.throws(function(){
					expr.addField("a.b", new ConstantExpression(6));
				}, Error);
			},

			"should throw an Error if a constant expression conflicts with an object expression": function testConflictingConstantObjectExpressionFields(){
				/** A constant expression conflicts with an object expression. */
				var expr = new ObjectExpression();
				expr.addField("a.b", new ConstantExpression(6));
				var subExpr = new ObjectExpression();
				subExpr.includePath("b");
				assert.throws(function(){
					expr.addField("a", subExpr);
				}, Error);
			},

			"should throw an Error if two nested expressions cannot generate the same field": function testConflictingNestedFields(){
				/** Two nested expressions cannot generate the same field. */
				var expr = new ObjectExpression();
				expr.addField("a.b", new ConstantExpression(5));
				assert.throws(function(){
					expr.addField("a.b", new ConstantExpression(6));	// Duplicate field.
				}, Error);
			},

			"should throw an Error if an expression is created for a subfield of another expression": function testConflictingFieldAndSubfield(){
				/** An expression cannot be created for a subfield of another expression. */
				var expr = new ObjectExpression();
				expr.addField("a", new ConstantExpression(5));
				assert.throws(function(){
					expr.addField("a.b", new ConstantExpression(5));
				}, Error);
			},

			"should throw an Error if an expression is created for a nested field of another expression.": function testConflictingFieldAndNestedField(){
				/** An expression cannot be created for a nested field of another expression. */
				var expr = new ObjectExpression();
				expr.addField("a", new ConstantExpression(5));
				var subExpr = new ObjectExpression();
				subExpr.addField("b", new ConstantExpression(5));
				assert.throws(function(){
					expr.addField("a", subExpr);
				}, Error);
			},

			"should throw an Error if an expression is created for a parent field of another expression": function testConflictingSubfieldAndField(){
				/** An expression cannot be created for a parent field of another expression. */
				var expr = new ObjectExpression();
				expr.addField("a.b", new ConstantExpression(5));
				assert.throws(function(){
					expr.addField("a", new ConstantExpression(5));
				}, Error);
			},

			"should throw an Error if an expression is created for a parent of a nested field": function testConflictingNestedFieldAndField(){
				/** An expression cannot be created for a parent of a nested field. */
				var expr = new ObjectExpression();
				var subExpr = new ObjectExpression();
				subExpr.addField("b", new ConstantExpression(5));
				expr.addField("a", subExpr);
				assert.throws(function(){
					expr.addField("a", new ConstantExpression(5));
				}, Error);
			},

			"should be able to evaluate expressions in general": function testEvaluate(){
				/**
				 * evaluate() does not supply an inclusion document.
				 * Inclusion spec'd fields are not included.
				 * (Inclusion specs are not generally expected/allowed in cases where evaluate is called instead of addToDocument.)
				 */
				var expr = new ObjectExpression();
				expr.includePath("a");
				expr.addField("b", new ConstantExpression(5));
				expr.addField("c", new FieldPathExpression("a"));
				assertEqualJson({"b":5, "c":1}, expr.evaluate({_id:0, a:1}));
			}
		},

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
