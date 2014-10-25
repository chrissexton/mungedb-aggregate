"use strict";
var assert = require("assert"),
	VariablesParseState = require("../../../../lib/pipeline/expressions/VariablesParseState"),
	VariablesIdGenerator = require("../../../../lib/pipeline/expressions/VariablesIdGenerator"),
	NaryExpressionT = require("../../../../lib/pipeline/expressions/NaryExpression"),
	ConstantExpression = require("../../../../lib/pipeline/expressions/ConstantExpression"),
	FieldPathExpression = require("../../../../lib/pipeline/expressions/FieldPathExpression"),
	Expression = require("../../../../lib/pipeline/expressions/Expression");

function constify(obj, parentIsArray) {
	parentIsArray = !parentIsArray ? false : true;
	var bob = parentIsArray ? [] : {};
	Object.keys(obj).forEach(function(key) {
		var elem = obj[key];
		if(elem.constructor === Object) {
			bob[key] = constify(elem, false);
		}
		else if(elem.constructor === Array && !parentIsArray) {
			bob[key] = constify(elem, true);
		}
		else if(key === "$const" ||
			elem.constructor === String && elem[0] === '$') {
			bob[key] = obj[key];
		}
		else {
			bob[key] = {$const:obj[key]}
		}
	});
	return bob;
};

function expressionToJson(expr) {
	return expr.serialize(false);
};

function assertDependencies(expectedDeps, expr) {
	var deps = new DepsTracker(),
		depsJson = [];
	expr.addDependencies(deps);
	deps.forEach(function(dep) {
		depsJson.push(dep);
	});
	assert.deepEqual(depsJson, expectedDeps);
	assert.equal(deps.needWholeDocument, false);
	assert.equal(deps.needTextScore, false);
};

// A dummy child of NaryExpression used for testing
var TestableExpression = (function(){
		// CONSTRUCTOR
	var klass = function TestableExpression(isAssociativeAndCommutative){
		this._isAssociativeAndCommutative = isAssociativeAndCommutative;
		base.call(this);
	}, base = NaryExpressionTemplate(TestableExpression), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.evaluateInternal = function evaluateInternal(vars) {
		// Just put all the values in a list.  This is not associative/commutative so
		// the results will change if a factory is provided and operations are reordered.
		return this.operands.map(function(operand) {
			return operand.evaluateInternal(vars);
		});
	};

	proto.isAssociativeAndCommutative = function isAssociativeAndCommutative(){
		return this._isAssociativeAndCommutative;
	};

	klass.create = function create(associativeAndCommutative) {
		associativeAndCommutative = !associativeAndCommutative ? false : true; //NOTE: coercing to bool -- defaults to false
		return new TestableExpression(associativeAndCommutative);
	};

	klass.factory = function factory() {
		return new TestableExpression(true);
	};

	proto.getOpName = function getOpName() {
		return "$testable";
	};

	proto.assertContents = function assertContents(expectedContents) {
		assert.deepEqual(constify({$testable:expectedContents}), expressionToJson(this));
	};

	klass.createFromOperands = function(operands, haveFactory) {
		haveFactory = !haveFactory ? false : true; //NOTE: coercing to bool -- defaults to false
		var vps = new VariablesParseState(new VariablesIdGenerator()),
			testable = new TestableExpression(haveFactory);
		operands.forEach(function(x) {
			testable.addOperand(Expression.parseOperand(x, vps));
		});
		return testable;
	};

	return klass;
})();


module.exports = {

	"NaryExpressionTemplate": {

		"generator": {

			"can generate a NaryExpression class": function() {
				assert.doesNotThrow(function() {
					var NaryExpressionClass = NaryExpressionTemplate(String),
						naryEpressionIntance = new NaryExpressionClass();
				});
			}

		}

	},

	"NaryExpression": {

		"statics": {

			"parseArguments":{

				"should parse a fieldPathExpression": function parsesFieldPathExpression() {
					var NaryExpressionClass = NaryExpressionTemplate(String),
						vps = new VariablesParseState(new VariablesIdGenerator()),
						parsedArguments = NaryExpressionClass.parseArguments("$field.path.expression", vps);
						assert.equal(parsedArguments.length, 1);
						assert(parsedArguments[0] instanceof FieldPathExpression);
				},

				"should parse an array of fieldPathExpressions": function parsesFieldPathExpression() {
					var NaryExpressionClass = NaryExpressionTemplate(String),
						vps = new VariablesParseState(new VariablesIdGenerator()),
						parsedArguments = NaryExpressionClass.parseArguments(["$field.path.expression", "$another.FPE"], vps);
						assert.equal(parsedArguments.length, 2);
						assert(parsedArguments[0] instanceof FieldPathExpression);
						assert(parsedArguments[1] instanceof FieldPathExpression);
				}
			}

		},

		"addOperand": {
			"run" : function run() {
				var testable = new TestableExpression.create();
				testable.addOperand(new ConstantExpression(9));
				debugger;
				testable.assertContents([9]);
				testable.addOperand(new FieldPathExpression("ab.c"));
				testable.assertContents([9, "$ab.c"]); //NOTE: Broken, not sure if problem with assertConents or FPE serialize
			}
		},

		"Dependencies": {
			"run": function run() {
				var testable = new TestableExpression.create();

				// No arguments.
				assertDependencies([], testable);

				// Add a constant argument.
				testable.addOperand(new ConstantExpression(1));
				assertDependencies([], testable);

				// Add a field path argument.
				testable.addOperand(new FieldPathExpression("ab.c"));
				assertDependencies(["ab.c"], testable);

				// Add an object expression.
				var spec = {a:"$x", q:"$r"},
					specElement = spec,
					ctx = new Expression.ObjectCtx({isDocumentOk:true}),
					vps = new VariablesParseState(new VariablesIdGenerator());
				testable.addOperand(Expression.parseObject(specElement, ctx, vps));
				assertDependencies(["ab.c", "r", "x"]);
			}
		},

		"AddToJsonObj": {
			"run": function run() {
				var testable = new TestableExpression.create();
				testable.addOperand(new ConstantExpression(5));
				assert.deepEqual(
						{foo:{$testable:[{$const:5}]}},
						{foo:testable.serialize(false)}
					);
			}
		},

		"AddToJsonArray": {
			"run": function run() {
				var testable = new TestableExpression.create();
				testable.addOperand(new ConstantExpression(5));
				assert.deepEqual(
						[{$testable:[{$const:5}]}],
						[testable.serialize(false)]
					);
			}
		},

		"OptimizeOneOperand": {
			"run": function run() {
				var spec = [{$and:[]},"$abc"],
					testable = TestableExpression.createFromOperands(spec);
				testable.assertContents(spec);
				assert.deepEqual(testable.serialize(), testable.optimize().serialize());
				assertContents([true, "$abc"])
			}
		},

		"EvaluateAllConstantOperands": {
			"run": function run() {
				var spec = [1,2],
					testable = TestableExpression.createFromOperands(spec);
				testable.assertContents(spec);
				var optimized = testable.optimize();
				assert.notDeepEqual(testable.serialize(), optimized.serialize());
				assert.deepEqual({$const:[1,2]}, expressionToJson(optimized));
			}
		},

		"NoFactoryOptimize": {
			// Without factory optimization, optimization will not produce a new expression.

			/** A string constant prevents factory optimization. */
			"StringConstant": function run() {
				var testable = TestableExpression.createFromOperands(["abc","def","$path"], true);
				assert.deepEqual(testable.serialize(), testable.optimize().serialize());
			},

			/** A single (instead of multiple) constant prevents optimization.  SERVER-6192 */
			"SingleConstant": function run() {
				var testable = TestableExpression.createFromOperands([55,"$path"], true);
				assert.deepEqual(testable.serialize(), testable.optimize().serialize());
			},

			/** Factory optimization is not used without a factory. */
			"NoFactory": function run() {
				var testable = TestableExpression.createFromOperands([55,66,"$path"], false);
				assert.deepEqual(testable.serialize(), testable.optimize().serialize());
			}
		},

		/** Factory optimization separates constant from non constant expressions. */
		"FactoryOptimize": {

			// The constant expressions are evaluated separately and placed at the end.
			"run": function run() {
				var testable = TestableExpression.createFromOperands([55,66,"$path"], false),
					optimized = testable.optimize();	
				assert.deepEqual({$testable:["$path", [55,66]]}, expressionToJson(optimized));
			}
		},

		/** Factory optimization flattens nested operators of the same type. */
		"FlattenOptimize": {
			"run": function run() {
				var testable = TestableExpression.createFromOperands(
						[55,"$path",{$add:[5,6,"$q"]},66],
					true);
				testable.addOperand(Testable.createFromOperands(
						[99,100,"$another_path"],
					true));
				var optimized = testable.optimize();
				assert.deepEqual(
					constify({$testable:[
							"$path",
							{$add:["$q", 11]},
							"$another_path",
							[55, 66, [99, 100]]
						]}),
					expressionToJson(optimized));
			}
		},

		/** Three layers of factory optimization are flattened. */
		"FlattenThreeLayers": {
			"run": function run() {
				var top = TestableExpression.createFromOperands([1,2,"$a"], true),
					nested = TestableExpression.createFromOperands([3,4,"$b"], true);
				nested.addOperand(TestableExpression.createFromOperands([5,6,"$c"],true));	
				top.addOperand(nested);
				var optimized = top.optimize();
				assert.deepEqual(
					constify({$testable:[
						"$a",
						"$b",
						"$c",
						[1,2,[3,4,[5,6]]]]}),
					expressionToJson(optimized));
			}
		},

		"constify": {
			"simple": function simple() {
				var obj = {a:'s'},
					constified = constify(obj);
				assert.deepEqual(constified, { a: { '$const': 's' } });
			},
			"array": function array() {
				var obj = {a:['s']},
					constified = constify(obj);
				assert.deepEqual(constified, { a: [ { '$const': 's' } ] });
			},
			"array2": function array2() {
				var obj = {a:['s', [5], {a:5}]},
					constified = constify(obj);
				assert.deepEqual(constified,
					{ a: 
						[{ '$const': 's' },
						 { '$const': [ 5 ] },
						 { a: { '$const': 5 } }]
					});
			},
			"object": function object() {
				var obj = {a:{b:{c:5}, d:'hi'}},
					constified = constify(obj);
				assert.deepEqual(constified, 
					{ a: 
						{ b: { c: { '$const': 5 } },
							d: { '$const': 'hi' } } });
			},
			"fieldPathExpression": function fieldPathExpression() {
				var obj = {a:"$field.path"},
					constified = constify(obj);
				assert.deepEqual(constified, obj);
			}
		}

	}
};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
