"use strict";
var assert = require("assert"),
	AddExpression = require("../../../../lib/pipeline/expressions/AddExpression"),
	ConstantExpression = require("../../../../lib/pipeline/expressions/ConstantExpression");


//TODO: refactor these test cases using Expression.parseOperand() or something because these could be a whole lot cleaner...
module.exports = {

	"AddExpression": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor() {
				assert.doesNotThrow(function () {
					new AddExpression();
				});
			},

			"should throw Error when constructing with args": function testConstructor() {
				assert.throws(function () {
					new AddExpression(1);
				});
			}
		},

		"#getOpName()": {

			"should return the correct op name; $add": function testOpName() {
				assert.equal(new AddExpression().getOpName(), "$add");
			}
		},

		"#evaluateInternal()": {

			"should return the operand if null document is given": function nullDocument() {
				var expr = new AddExpression();
				expr.addOperand(new ConstantExpression(2));
				assert.equal(expr.evaluateInternal(null), 2);
			},

			"should return 0 if no operands were given": function noOperands() {
				var expr = new AddExpression();
				assert.equal(expr.evaluateInternal({}), 0);
			},

			"should throw Error if a Date operand was given": function date() {
				var expr = new AddExpression();
				expr.addOperand(new ConstantExpression(new Date()));
				assert.throws(function () {
					expr.evaluateInternal({});
				});
			},

			"should throw Error if a String operand was given": function string() {
				var expr = new AddExpression();
				expr.addOperand(new ConstantExpression(""));
				assert.throws(function () {
					expr.evaluateInternal({});
				});
			},

			"should throw Error if a Boolean operand was given": function bool() {
				var expr = new AddExpression();
				expr.addOperand(new ConstantExpression(true));
				assert.throws(function () {
					expr.evaluateInternal({});
				});
			},

			"singleOperandBase": {
				beforeEach: function () {
					this.expectedResult = function (_input_, _expected_) {
						var expr = new AddExpression();
						expr.addOperand(new ConstantExpression(_input_));
						assert.equal(expr.evaluateInternal({}), _expected_);
					}
				},

				"should pass through a single number": function number() {
					this.expectedResult(123, 123);
				},

				"should pass through a single null": function nullSupport() {
					this.expectedResult(null, 0);
				},

				"should pass through a single undefined": function undefinedSupport() {
					this.expectedResult(undefined, 0);
				},
				"should pass through a single float": function () {
					var v = 123.234;
					this.expectedResult(v, v);
				},
				"should pass through a single date": function () {
					var v = new Date();
					this.expectedResult(v, v);
				}
			},

			"TwoOperand": {
				beforeEach: function () {
					this.reverse = function (array) {
						var reversed = [];
						array.forEach(function (a) {
							reversed.unshift(a);
						})
						return reversed;
					};
					this.compareBothWays = function (array, expected) {
						this.compare(array, expected);
						this.compare(this.reverse(array), expected);
					};
					this.compare = function (array, expected) {
						var expr = new AddExpression();
						array.forEach(function (input) {
							expr.addOperand(new ConstantExpression(input));
						});
						assert.equal(expr.evaluateInternal({}), expected);
					}
				},
				"should add two numbers": function numbers() {
					this.compareBothWays([1, 5], 6);
				},

				"should add a number and a null": function numberAndNull() {
					this.compareBothWays([1, null], 1);
				},

				"should add a number and an undefined": function numberAndUndefined() {
					this.compareBothWays([1, undefined], 1);
				},

				"should add several numbers": function () {
					this.compareBothWays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 55);
				},

				"should add floats": function () {
					this.compareBothWays([1.1, 2.2, 3.3], 6.6);
				},

				"should add an int and a date and get a date": function () {
					var d = new Date();
					this.compareBothWays([d, 10], d.getTime() + 10);
				},

				"We can't add 2 dates": function () {
					assert(function () {
						this.compareBothWays([new Date(), new Date()], 0);
					});
				}
			}
		}
	}

};

if (!module.parent)(new (require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
