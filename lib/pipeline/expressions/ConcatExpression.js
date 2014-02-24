"use strict";

/** 
 * Creates an expression that concatenates a set of string operands.
 * @class ConcatExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var ConcatExpression = module.exports = function ConcatExpression(){
	if (arguments.length !== 0) throw new Error("zero args expected");
	base.call(this);
}, klass = ConcatExpression, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

// DEPENDENCIES
var Value = require("../Value");
var Expression = require("./Expression");

// PROTOTYPE MEMBERS
proto.getOpName = function getOpName(){
	return "$concat";
};

proto.getFactory = function getFactory(){
	return klass;	// using the ctor rather than a separate .create() method
};

/**
 * Concats a string of values together.
 * @method evaluate
 **/
proto.evaluateInternal = function evaluateInternal(vars) {
	var result = "";
	for (var i = 0, n = this.operands.length; i < n; ++i) {
		var val = this.operands[i].evaluateInternal(vars);
		if (val === null) return null; // if any operand is null, return null for all
		if (typeof(val) != "string") throw new Error("$concat only supports strings, not " + typeof(val) + "; code 16702");
		result = result + Value.coerceToString(val);
	}
	return result;
};

/** Register Expression */
Expression.registerExpression("$concat", klass.parse(ConcatExpression));