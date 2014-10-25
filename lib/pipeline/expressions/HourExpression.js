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
	//this.nargs = 1;
	//base.call(this);
}, klass = HourExpression, base = require("./FixedArityExpressionT")(klass, 1), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

//STATIC MEMBERS
klass.extract = function extract(date) {
	return date.getUTCHours();
};

klass.opName = "$hour";

// PROTOTYPE MEMBERS
proto.getOpName = function getOpName(){
	return klass.opName;
};

// DEPENDENCIES
var Expression = require("./Expression");

/**
 * Takes a date and returns the hour between 0 and 23.
 * @method evaluateInternal
 **/
proto.evaluateInternal = function evaluateInternal(vars){
	var date = this.operands[0].evaluateInternal(vars);

	//NOTE: DEVIATION FROM MONGO: need to return a Value object.  Our Value class only consists of static helpers at the moment.  We need a value instance to be consistent.
	return klass.extract(date);
};


/** Register Expression */
Expression.registerExpression(klass.opName,base.parse(klass));
