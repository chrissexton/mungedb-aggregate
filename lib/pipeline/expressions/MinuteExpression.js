"use strict";

/** 
 * An $minute pipeline expression.
 * @see evaluateInternal
 * @class MinuteExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var MinuteExpression = module.exports = function MinuteExpression() {
		this.fixedArity(1);
		if (arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
}, klass = MinuteExpression,
		base = require("./NaryExpression"),
		proto = klass.prototype = Object.create(base.prototype, {
				constructor: {
						value: klass
				}
		});

// DEPENDENCIES
var Expression = require("./Expression");

// PROTOTYPE MEMBERS
proto.getOpName = function getOpName() {
		return "$minute";
};

/** 
 * Takes a date and returns the minute between 0 and 59.
 * @method evaluateInternal
 **/
proto.evaluateInternal = function evaluateInternal(doc) {
		this.checkArgCount(1);
		var date = this.operands[0].evaluateInternal(doc);
		return date.getUTCMinutes();
};

/** Register Expression */
Expression.registerExpression("$minute", MinuteExpression.parse);