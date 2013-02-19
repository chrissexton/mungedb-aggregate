var assert = require("assert"),
	SubtractExpression = require("../../../../lib/pipeline/expressions/SubtractExpression"),
	Expression = require("../../../../lib/pipeline/expressions/Expression");

module.exports = {

	"SubtractExpression": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new SubtractExpression();
				});
			}

		},

		"#getOpName()": {

			"should return the correct op name; $subtract": function testOpName(){
				assert.equal(new SubtractExpression().getOpName(), "$subtract");
			}

		},

		"#getFactory()": {

			"should return the constructor for this class": function factoryIsConstructor(){
				assert.strictEqual(new SubtractExpression().getFactory(), undefined);
			}

		},

		"#evaluate()": {

			"should return the result of subtraction between two numbers": function testStuff(){
				assert.strictEqual(Expression.parseOperand({$subtract:["$a", "$b"]}).evaluate({a:35636364, b:-0.5656}), 35636364-(-0.5656));
			}
		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);