"use strict";

/** 
 * Create an expression that returns true exists in any element. 
 * @class AnyElementExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var AnyElementExpression = module.exports = function AnyElementExpression(){
	if (arguments.length !== 0) throw new Error("zero args expected");
	base.call(this);
}, klass = AnyElementExpression, NaryExpression = require("./NaryExpression"), base = NaryExpression, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

// DEPENDENCIES
var Value = require("../Value"),
	Expression = require("./Expression");

// PROTOTYPE MEMBERS
proto.getOpName = function getOpName(){
	return "$anyElement";
};

/**
 * Takes an array of one or more numbers and returns true if any.
 * @method @evaluate
 **/
proto.evaluateInternal = function evaluateInternal(doc) {

	if (!doc instanceof Array) throw new Error("$anyElement requires an array");
	var total = 0;
	for (var i = 0, n = doc.length; i < n; ++i) {
		var value = doc[i].evaluateInternal(doc);
		if ( value.coerceToDouble() )
			return true;
	}
};


/** Register Expression */
Expression.registerExpression("$anyElement",AnyElementExpression.parse);