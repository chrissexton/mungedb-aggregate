"use strict";

/** 
 * A $not pipeline expression.
 * @see evaluateInternal
 * @class NotExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var NotExpression = module.exports = function NotExpression() {
		this.fixedArity(1);
		if (arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
}, klass = NotExpression,
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
		return "$not";
};

/** 
 * Returns the boolean opposite value passed to it. When passed a true value, $not returns false; when passed a false value, $not returns true.
 * @method evaluateInternal
 **/
proto.evaluateInternal = function evaluateInternal(doc) {
		var op = this.operands[0].evaluateInternal(doc);
		return !Value.coerceToBool(op);
};

/** Register Expression */
Expression.registerExpression("$not", NotExpression.parse);