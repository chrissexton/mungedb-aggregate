"use strict";
var assert = require("assert"),
	ConstantExpression = require("../../../../lib/pipeline/expressions/ConstantExpression");


module.exports = {

	"ConstantExpression": {

		"constructor()": {

			"should accept one argument": function () {
				new ConstantExpression(5);
			},
			"should not accept 0 arguments": function () {
				assert.throws(new function () {
					new ConstantExpression();
				});
			},
			"should not accept 2 arguments": function () {
				assert.throws(new function () {
					new ConstantExpression(1, 2);
				});
			}
		},


		"#evaluate()": {
			"should do what comes natural with an int": function () {
				var c = 567;
				var expr = new ConstantExpression(c);
				assert.deepEqual(expr.evaluate(), c);
			},
			"should do what comes natural with a float": function () {
				var c = 567.123;
				var expr = new ConstantExpression(c);
				assert.deepEqual(expr.evaluate(), c);
			},
			"should do what comes natural with a String": function () {
				var c = "Quoth the raven";
				var expr = new ConstantExpression(c);
				assert.deepEqual(expr.evaluate(), c);
			},
			"should do what comes natural with a date": function () {
				var c = new Date();
				var expr = new ConstantExpression(c);
				assert.deepEqual(expr.evaluate(), c);
			}
		},

		"#optimize()": {
			"should not optimize anything": function testOptimize() {
				var expr = new ConstantExpression(5);
				assert.strictEqual(expr, expr.optimize());
			}

		},

		"#addDependencies()": {
			"should return nothing": function testDependencies() {
				assert.strictEqual(new ConstantExpression(5).addDependencies(), undefined);
			}

		}
	}
};

if (!module.parent)(new (require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
