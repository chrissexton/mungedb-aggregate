"use strict";

/** 
 * An $second pipeline expression. 
 * @see evaluate 
 * @class SecondExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var SecondExpression = module.exports = function SecondExpression(){
	if (arguments.length !== 0) throw new Error("zero args expected");
	base.call(this);
}, klass = SecondExpression, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

// PROTOTYPE MEMBERS
proto.getOpName = function getOpName(){
	return "$second";
};

proto.addOperand = function addOperand(expr) {
	this.checkArgLimit(1);
	base.prototype.addOperand.call(this, expr);
};

/**
 * Takes a date and returns the second between 0 and 59, but can be 60 to account for leap seconds.
 * @method evaluate
 **/
proto.evaluate = function evaluate(doc){
	this.checkArgCount(1);
	var date = this.operands[0].evaluate(doc);
	return date.getUTCSeconds();	//TODO: incorrect for last second of leap year, need to fix...
	// currently leap seconds are unsupported in v8
	// http://code.google.com/p/v8/issues/detail?id=1944
};
