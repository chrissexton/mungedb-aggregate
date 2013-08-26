"use strict";

/**
 * Get the DayOfMonth from a date.
 * @class DayOfMonthExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var DayOfMonthExpression = module.exports = function DayOfMonthExpression(){
	if (arguments.length !== 0) throw new Error("zero args expected");
	base.call(this);
}, klass = DayOfMonthExpression, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

// PROTOTYPE MEMBERS
proto.getOpName = function getOpName(){
	return "$dayOfMonth";
};

proto.addOperand = function addOperand(expr) {
	this.checkArgLimit(1);
	base.prototype.addOperand.call(this, expr);
};

/**
 * Takes a date and returns the day of the month as a number between 1 and 31.
 * @method evaluate
 **/
proto.evaluate = function evaluate(doc){
	this.checkArgCount(1);
	var date = this.operands[0].evaluate(doc);
	return date.getUTCDate();
};
