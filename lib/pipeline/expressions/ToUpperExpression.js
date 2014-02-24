"use strict";

/** 
 * A $toUpper pipeline expression.
 * @see evaluateInternal
 * @class ToUpperExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var ToUpperExpression = module.exports = function ToUpperExpression() {
		this.fixedArity(1);
		if (arguments.length !== 1) throw new Error("one args expected");
		base.call(this);
}, klass = ToUpperExpression,
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
		return "$toUpper";
};

/** 
 * Takes a single string and converts that string to lowercase, returning the result. All uppercase letters become lowercase.
 **/
proto.evaluateInternal = function evaluateInternal(vars) {
		var val = this.operands[0].evaluateInternal(vars),
				str = Value.coerceToString(val);
		return str.toUpperCase();
};

/** Register Expression */
Expression.registerExpression("$toUpper", klass.parse(ToUpperExpression));