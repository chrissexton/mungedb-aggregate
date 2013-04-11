"use strict";
var assert = require("assert"),
	CondExpression = require("../../../../lib/pipeline/expressions/CondExpression"),
	Expression = require("../../../../lib/pipeline/expressions/Expression");


module.exports = {

	"CondExpression": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new CondExpression();
				});
			}

		},

		"#getOpName()": {

			"should return the correct op name; $cond": function testOpName(){
				assert.equal(new CondExpression().getOpName(), "$cond");
			}

		},

		"#getFactory()": {

			"should return the constructor for this class": function factoryIsConstructor(){
				assert.strictEqual(new CondExpression().getFactory(), undefined);
			}

		},

		"#evaluate()": {

			"should evaluate boolean expression as true, then return 1; [ true === true, 1, 0 ]": function testStuff(){
				assert.strictEqual(Expression.parseOperand({$cond:[ true === true, 1, 0 ]}).evaluate({}), 1);
			},

			"should evaluate boolean expression as false, then return 0; [ false === true, 1, 0 ]": function testStuff(){
				assert.strictEqual(Expression.parseOperand({$cond:[ false === true, 1, 0 ]}).evaluate({}), 0);
			}, 

			"should evaluate boolean expression as true, then return 1; [ (true === true) && true, 1, 0 ]": function testStuff(){
				assert.strictEqual(Expression.parseOperand({$cond:[ (true === true) && true , 1, 0 ]}).evaluate({}), 1);
			},

			"should evaluate boolean expression as false, then return 0; [ (false === true) && true, 1, 0 ]": function testStuff(){
				assert.strictEqual(Expression.parseOperand({$cond:[ (false === true) && true, 1, 0 ]}).evaluate({}), 0);
			},

			"should evaluate complex boolean expression as true, then return 1; [ ( 1 > 0 ) && (( 'a' == 'b' ) || ( 3 <= 5 )), 1, 0 ]": function testStuff(){
				assert.strictEqual(Expression.parseOperand({$cond:[ ( 1 > 0 ) && (( 'a' == 'b' ) || ( 3 <= 5 )), 1, 0 ]}).evaluate({}), 1);
			},
		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
