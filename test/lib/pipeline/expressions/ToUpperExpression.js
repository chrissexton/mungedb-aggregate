"use strict";
var assert = require("assert"),
	ToUpperExpression = require("../../../../lib/pipeline/expressions/ToUpperExpression"),
	Expression = require("../../../../lib/pipeline/expressions/Expression");


module.exports = {

	"ToUpperExpression": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new ToUpperExpression();
				});
			}

		},

		"#getOpName()": {

			"should return the correct op name; $toUpper": function testOpName(){
				assert.equal(new ToUpperExpression().getOpName(), "$toUpper");
			}

		},

		"#getFactory()": {

			"should return the constructor for this class": function factoryIsConstructor(){
				assert.strictEqual(new ToUpperExpression().getFactory(), undefined);
			}

		},

		"#evaluate()": {

			"should return the uppercase version of the string if there is a null character in the middle of the string": function testStuff(){
				assert.strictEqual(Expression.parseOperand({$toUpper:"$a"}).evaluate({a:"a\0B"}), "A\0B");
			},
			"should return the uppercase version of the string if there is a null character at the beginning of the string": function testStuff(){
				assert.strictEqual(Expression.parseOperand({$toUpper:"$a"}).evaluate({a:"\0aB"}), "\0AB");
			},
			"should return the uppercase version of the string if there is a null character at the end of the string": function testStuff(){
				assert.strictEqual(Expression.parseOperand({$toUpper:"$a"}).evaluate({a:"aB\0"}), "AB\0");
			}
		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
