"use strict";

/**
 * Get the DayOfWeek from a date.
 * @class DayOfWeekExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var DayOfWeekExpression = module.exports = function DayOfWeekExpression(){
	this.fixedArity(1);
	if (arguments.length !== 0) throw new Error("zero args expected");
	base.call(this);
}, klass = DayOfWeekExpression, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

// DEPENDENCIES
var	Expression = require("./Expression");

// PROTOTYPE MEMBERS
proto.getOpName = function getOpName(){
	return "$dayOfWeek";
};

/**
 * Takes a date and returns the day of the week as a number between 1 (Sunday) and 7 (Saturday.)
 * @method evaluate
 **/
proto.evaluateInternal = function evaluateInternal(doc){
	this.checkArgCount(1);
	var date = this.operands[0].evaluateInternal(doc);
	return date.getUTCDay()+1;
};

/** Register Expression */
Expression.registerExpression("$dayOfWeek",DayOfWeekExpression.parse);