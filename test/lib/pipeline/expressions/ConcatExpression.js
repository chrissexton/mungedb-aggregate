"use strict";
var assert = require("assert"),
	ConcatExpression = require("../../../../lib/pipeline/expressions/ConcatExpression"),
	Expression = require("../../../../lib/pipeline/expressions/Expression");


module.exports = {

	"ConcatExpression": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new ConcatExpression();
				});
			}

		},

		"#getOpName()": {

			"should return the correct op name; $concat": function testOpName(){
				assert.equal(new ConcatExpression().getOpName(), "$concat");
			}

		},

		"#getFactory()": {

			"should return the constructor for this class": function factoryIsConstructor(){
				assert.equal(new ConcatExpression().getFactory(), ConcatExpression);
			}

		},

		"#evaluate()": {

			"should return empty string if no operands were given; {$concat:[]}": function testEmpty(){
				assert.equal(Expression.parseOperand({$concat:[]}).evaluate(), "");
			},

			"should return mystring if operands are my string; {$concat:[my, string]}": function testConcat(){
				assert.equal(Expression.parseOperand({$concat:["my", "string"]}).evaluate(), "mystring");
			},

			"should return mystring if operands are my and $a; {$concat:[my,$a]}": function testFieldPath(){
				assert.equal(Expression.parseOperand({$concat:["my","$a"]}).evaluate({a:"string"}), "mystring");
			},

			"should return null if an operand evaluates to null; {$concat:[my,$a]}": function testNull(){
				assert.equal(Expression.parseOperand({$concat:["my","$a"]}).evaluate({a:null}), null);
			}

		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
