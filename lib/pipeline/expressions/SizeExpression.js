"use strict";

/** 
 * A $size pipeline expression.
 * @see evaluateInternal
 * @class SizeExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var SizeExpression = module.exports = function SizeExpression() {
		this.fixedArity(1);
		if (arguments.length !== 1) throw new Error("one arg expected");
		base.call(this);
}, klass = SizeExpression,
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
		return "$size";
};

/** 
 * Takes an array and return the size.
 **/
proto.evaluateInternal = function evaluateInternal(doc) {
		this.checkArgCount(1);
		var array = this.operands[0].evaluateInternal(doc);
		if (array instanceof Date) throw new Error("$size does not support dates; code 16376");
		return array.length;
};

/** Register Expression */
Expression.registerExpression("$size", SizeExpression.parse);