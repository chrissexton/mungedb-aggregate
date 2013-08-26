"use strict";

/** 
 * A $year pipeline expression.
 * @see evaluate 
 * @class YearExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var YearExpression = module.exports = function YearExpression(){
	if (arguments.length !== 0) throw new Error("zero args expected");
	base.call(this);
}, klass = YearExpression, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

// DEPENDENCIES
var Value = require("../Value"),
	DayOfYearExpression = require("./DayOfYearExpression");

// PROTOTYPE MEMBERS
proto.getOpName = function getOpName(){
	return "$year";
};

proto.addOperand = function addOperand(expr) {
	this.checkArgLimit(1);
	base.prototype.addOperand.call(this, expr);
};

/**
 * Takes a date and returns the full year.
 * @method evaluate
 **/
proto.evaluate = function evaluate(doc) {
	this.checkArgCount(1);
	var date = this.operands[0].evaluate(doc);
	return date.getUTCFullYear();
};
