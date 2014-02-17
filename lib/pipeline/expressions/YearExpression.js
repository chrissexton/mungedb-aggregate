"use strict";

/** 
 * A $year pipeline expression.
 * @see evaluateInternal
 * @class YearExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var YearExpression = module.exports = function YearExpression() {
		this.fixedArity(1);
		if (arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
}, klass = YearExpression,
		base = require("./NaryExpression"),
		proto = klass.prototype = Object.create(base.prototype, {
				constructor: {
						value: klass
				}
		});

// DEPENDENCIES
var Value = require("../Value"),
		DayOfYearExpression = require("./DayOfYearExpression"),
		Expression = require("./Expression");


// PROTOTYPE MEMBERS
proto.getOpName = function getOpName() {
		return "$year";
};

/**
 * Takes a date and returns the full year.
 * @method evaluateInternal
 **/
proto.evaluateInternal = function evaluateInternal(doc) {
		this.checkArgCount(1);
		var date = this.operands[0].evaluateInternal(doc);
		return date.getUTCFullYear();
};

/** Register Expression */
Expression.registerExpression("$year", YearExpression.parse);