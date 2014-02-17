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
	if (arguments.length !== 0) throw new Error("zero args expected");
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
proto.evaluateInternal = function evaluateInternal(doc){
	this.checkArgCount(1);
	var date = this.operands[0].evaluateInternal(doc);
	return date.getUTCHours();
};


/** Register Expression */
Expression.registerExpression("$hour",HourExpression.parse);