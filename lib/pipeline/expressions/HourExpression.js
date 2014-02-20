"use strict";

/** 
 * An $hour pipeline expression. 
 * @see evaluateInternal 
 * @class HourExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var HourExpression = module.exports = function HourExpression(){
	this.fixedArity(1);
	if (arguments.length !== 1) throw new Error("one arg expected");
	base.call(this);
}, klass = HourExpression, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

// PROTOTYPE MEMBERS
proto.getOpName = function getOpName(){
	return "$hour";
};

// DEPENDENCIES
var	Expression = require("./Expression");

/** 
 * Takes a date and returns the hour between 0 and 23. 
 * @method evaluateInternal
 **/
proto.evaluateInternal = function evaluateInternal(vars){
	var date = this.operands[0].evaluateInternal(vars);
	return date.getUTCHours();
};


/** Register Expression */
Expression.registerExpression("$hour",HourExpression.parse);
