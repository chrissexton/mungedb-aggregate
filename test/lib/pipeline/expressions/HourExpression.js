var assert = require("assert"),
	HourExpression = require("../../../../lib/pipeline/expressions/HourExpression"),
	Expression = require("../../../../lib/pipeline/expressions/Expression");

module.exports = {

	"HourExpression": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new HourExpression();
				});
			}

		},

		"#getOpName()": {

			"should return the correct op name; $hour": function testOpName(){
				assert.equal(new HourExpression().getOpName(), "$hour");
			}

		},

		"#getFactory()": {

			"should return the constructor for this class": function factoryIsConstructor(){
				assert.strictEqual(new HourExpression().getFactory(), undefined);
			}

		},

		"#evaluate()": {

			"should return hour; 15 for 2013-02-18 3:00pm": function testStuff(){
				assert.strictEqual(Expression.parseOperand({$hour:"$someDate"}).evaluate({someDate:new Date("2013-02-18 3:00 pm GMT-0500 (EST)")}), 15);
			}

		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);