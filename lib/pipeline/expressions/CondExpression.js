"use strict";

/**
 * $cond expression;  @see evaluate
 * @class CondExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var CondExpression = module.exports = function CondExpression(vars) {
		this.fixedArity(3);
		this.pCond = this.evaluateInternal(vars);
		this.idx = this.pCond.coerceToBool() ? 1 : 2;
		//return vpOperand[this.idx].evaluateInternal(vars);

		if (arguments.length !== 3) throw new Error("zero args expected");
		base.call(this);
}, klass = CondExpression,
		base = require("./NaryExpression"),
		proto = klass.prototype = Object.create(base.prototype, {
				constructor: {
						value: klass
				}
		});

// DEPENDENCIES
var Value = require("../Value"),
		Expression = require("./Expression");

// PROTOTYPE MEMBERS
proto.getOpName = function getOpName() {
		return "$cond";
};

proto.parse = function parse(expr, vps) {
		this.checkArgLimit(3);

		// if not an object, return;
		if (typeof(expr) !== Object)
				return Expression.parse(expr, vps);

		// verify 
		if (Expression.parseOperand(expr) !== "$cond")
				throw new Error("Invalid expression");

		var ret = new CondExpression();

		var ex = Expression.parseObject(expr);
		var args = Expression.parseOperand(expr, vps);
		if (args[0] !== "if")
				throw new Error("Missing 'if' parameter to $cond");
		if (args[1] !== "then")
				throw new Error("Missing 'then' parameter to $cond");
		if (args[2] !== "else")
				throw new Error("Missing 'else' parameter to $cond");


		return ret;
};

/** 
 * Use the $cond operator with the following syntax:  { $cond: [ <boolean-expression>, <true-case>, <false-case> ] }
 * @method evaluate
 **/
proto.evaluateInternal = function evaluateInternal(vars) {
		var pCond1 = this.operands[0].evaluateInternal(vars);

		this.idx = 0;
		if (pCond1.coerceToBool()) {
				this.idx = 1;
		} else {
				this.idx = 2;
		}

		return this.operands[this.idx].evaluateInternal(vars);
};

proto.evaluateInternal = function evaluateInternal(vars) {
		this.checkArgCount(1);
		var date = this.operands[0].evaluateInternal(vars);


		return date.getUTCDate();
};


/** Register Expression */
Expression.registerExpression("$cond", CondExpression.parse);