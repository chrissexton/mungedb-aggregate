var assert = require("assert"),
	IndexOfExpression = require("../../../../lib/pipeline/expressions/IndexOfExpression"),
	Expression = require("../../../../lib/pipeline/expressions/Expression");

module.exports = {

	"IndexOfExpression": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new IndexOfExpression();
				});
			}

		},

		"#getOpName()": {

			"should return the correct op name; $indexOf": function testOpName(){
				assert.equal(new IndexOfExpression().getOpName(), "$indexOf");
			}

		},

		"#getFactory()": {

			"should return the constructor for this class": function factoryIsConstructor(){
				assert.strictEqual(new IndexOfExpression().getFactory(), undefined);
			}

		},

		"#evaluate()": {

			"should return the index of the first match if found": function testFound(){
				assert.strictEqual(Expression.parseOperand({$indexOf:["$needle", "$haystack"]}).evaluate({needle:1, haystack:[1,2,3]}), 0);
				assert.strictEqual(Expression.parseOperand({$indexOf:["$needle", "$haystack"]}).evaluate({needle:3, haystack:[1,2,3]}), 2);
			},

			"should return `-1` if not found": function testNotFound(){
				assert.strictEqual(Expression.parseOperand({$indexOf:["$needle", "$haystack"]}).evaluate({needle:0, haystack:[1,2,3]}), -1);
			},

			"should return `undefined` if the 1st arg (the `needle`) is undefined or missing": function testNeedleUndefinedOrMissing(){
				assert.strictEqual(Expression.parseOperand({$indexOf:["$needle", "$haystack"]}).evaluate({needle:undefined, haystack:[1,2,3]}), undefined);
				assert.strictEqual(Expression.parseOperand({$indexOf:["$needle", "$haystack"]}).evaluate({haystack:[1,2,3]}), undefined);
			},

			"should return `undefined` if the 1st arg (the `haystack`) is undefined or missing": function testHaystackUndefinedOrMissing(){
				assert.strictEqual(Expression.parseOperand({$indexOf:["$needle", "$haystack"]}).evaluate({needle:0, haystack:undefined}), undefined);
				assert.strictEqual(Expression.parseOperand({$indexOf:["$needle", "$haystack"]}).evaluate({needle:0}), undefined);
			},

			"should throw if 2nd arg (the `haystack`) is not an `Array`": function testHaystackNonArray(){
				assert.throws(function(){
					Expression.parseOperand({$indexOf:["$needle", "$haystack"]}).evaluate({needle:0, haystack:0});
				});
			}

		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);