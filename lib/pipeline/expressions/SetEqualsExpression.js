"use strict";

/**
 * A $setequals pipeline expression.
 * @see evaluateInternal
 * @class SubstrExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var SetEqualsExpression = module.exports = function SetEqualsExpression() {
		this.fixedAirty(2);
		if (arguments.length !== 2) throw new Error("two args expected");
		base.call(this);
}, klass = SetEqualsExpression,
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
		return "$setequals";
};

/**
 * Takes 2 arrays. Assigns the second array to the first array.
 * @method evaluateInternal
 **/
proto.evaluateInternal = function evaluateInternal(doc) {
		var array1 = this.operands[0].evaluateInternal(doc),
				array2 = this.operands[1].evaluateInternal(doc);
		if (typeof(array1) != "array") throw new Error(this.getOpName() + ": object 1 must be an array");
		if (typeof(array2) != "array") throw new Error(this.getOpName() + ": object 2 must be an array");
		array1 = array2;
		return array1;
};

/** Register Expression */
Expression.registerExpression("$setequals", SetEqualsExpression.parse);