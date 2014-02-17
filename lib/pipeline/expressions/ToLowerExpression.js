"use strict";
	
/** 
 * A $toLower pipeline expression.
 * @see evaluateInternal 
 * @class ToLowerExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var ToLowerExpression = module.exports = function ToLowerExpression(){
	if (arguments.length !== 0) throw new Error("zero args expected");
	base.call(this);
}, klass = ToLowerExpression, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

// DEPENDENCIES
var Value = require("../Value"),
 Expression = require("./Expression");

// PROTOTYPE MEMBERS
proto.getOpName = function getOpName(){
	return "$toLower";
};

/** 
* Takes a single string and converts that string to lowercase, returning the result. All uppercase letters become lowercase. 
**/
proto.evaluateInternal = function evaluateInternal(doc) {
	this.checkArgCount(1);
	var val = this.operands[0].evaluateInternal(doc),
		str = Value.coerceToString(val);
	return str.toLowerCase();
};

/** Register Expression */
Expression.registerExpression("$toLower", ToLowerExpression.parse);