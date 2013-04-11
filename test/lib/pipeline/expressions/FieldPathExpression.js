"use strict";
var assert = require("assert"),
	FieldPathExpression = require("../../../../lib/pipeline/expressions/FieldPathExpression");


module.exports = {

	"FieldPathExpression": {

		"constructor()": {

			"should throw Error if empty field path": function testInvalid(){
				assert.throws(function() {
					new FieldPathExpression('');
				});
			}

		},

		"#evaluate()": {

			"should return undefined if field path is missing": function testMissing(){
				assert.strictEqual(new FieldPathExpression('a').evaluate({}), undefined);
			},

			"should return value if field path is present": function testPresent(){
				assert.strictEqual(new FieldPathExpression('a').evaluate({a:123}), 123);
			},

			"should return undefined if field path is nested below null": function testNestedBelowNull(){
				assert.strictEqual(new FieldPathExpression('a.b').evaluate({a:null}), undefined);
			},

			"should return undefined if field path is nested below undefined": function NestedBelowUndefined(){
				assert.strictEqual(new FieldPathExpression('a.b').evaluate({a:undefined}), undefined);
			},

			"should return undefined if field path is nested below Number": function testNestedBelowInt(){
				assert.strictEqual(new FieldPathExpression('a.b').evaluate({a:2}), undefined);
			},

			"should return value if field path is nested": function testNestedValue(){
				assert.strictEqual(new FieldPathExpression('a.b').evaluate({a:{b:55}}), 55);
			},

			"should return undefined if field path is nested below empty Object": function testNestedBelowEmptyObject(){
				assert.strictEqual(new FieldPathExpression('a.b').evaluate({a:{}}), undefined);
			},

			"should return empty Array if field path is nested below empty Array": function testNestedBelowEmptyArray(){
				assert.deepEqual(new FieldPathExpression('a.b').evaluate({a:[]}), []);
			},

			"should return Array with null if field path is nested below Array containing null": function testNestedBelowArrayWithNull(){
				assert.deepEqual(new FieldPathExpression('a.b').evaluate({a:[null]}), [null]);
			},

			"should return Array with undefined if field path is nested below Array containing undefined": function testNestedBelowArrayWithUndefined(){
				assert.deepEqual(new FieldPathExpression('a.b').evaluate({a:[undefined]}), [undefined]);
			},

			"should throw Error if field path is nested below Array containing a Number": function testNestedBelowArrayWithInt(){
				assert.throws(function(){
					new FieldPathExpression('a.b').evaluate({a:[1]});
				});
			},

			"should return Array with value if field path is in Object within Array": function testNestedWithinArray(){
				assert.deepEqual(new FieldPathExpression('a.b').evaluate({a:[{b:9}]}), [9]);
			},

			"should return Array with multiple value types if field path is within Array with multiple value types": function testMultipleArrayValues(){
				var path = 'a.b',
					doc = {a:[{b:9},null,undefined,{g:4},{b:20},{}]},
					expected = [9,null,undefined,undefined,20,undefined];
				assert.deepEqual(new FieldPathExpression(path).evaluate(doc), expected);
			},

			"should return Array with expanded values from nested multiple nested Arrays": function testExpandNestedArrays(){
				var path = 'a.b.c',
					doc = {a:[{b:[{c:1},{c:2}]},{b:{c:3}},{b:[{c:4}]},{b:[{c:[5]}]},{b:{c:[6,7]}}]},
					expected = [[1,2],3,[4],[[5]],[6,7]];
				assert.deepEqual(new FieldPathExpression(path).evaluate(doc), expected);
			},

			"should return null if field path points to a null value": function testPresentNull(){
				assert.strictEqual(new FieldPathExpression('a').evaluate({a:null}), null);
			},

			"should return undefined if field path points to a undefined value": function testPresentUndefined(){
				assert.strictEqual(new FieldPathExpression('a').evaluate({a:undefined}), undefined);
			},

			"should return Number if field path points to a Number value": function testPresentNumber(){
				assert.strictEqual(new FieldPathExpression('a').evaluate({a:42}), 42);
			}

		},

		"#optimize()": {

			"should not optimize anything": function testOptimize(){
				var expr = new FieldPathExpression('a');
				assert.strictEqual(expr, expr.optimize());
			}

		},

		"#addDependencies()": {

			"should return the field path itself as a dependency": function testDependencies(){
				var deps = new FieldPathExpression('a.b').addDependencies([]);
				assert.strictEqual(deps.length, 1);
				assert.strictEqual(deps[0], 'a.b');
			}

		},

		"#toJson()": {

			"should output path String with a '$'-prefix": function testJson(){
				assert.equal(new FieldPathExpression('a.b.c').toJson(), "$a.b.c");
			}

		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
