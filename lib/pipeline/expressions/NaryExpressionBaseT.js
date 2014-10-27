"use strict";

var NaryExpression = require("./NaryExpression");

/**
* Inherit from ExpressionVariadic or ExpressionFixedArity instead of directly from this class.
* @class NaryExpressionBaseT
* @namespace mungedb-aggregate.pipeline.expressions
* @module mungedb-aggregate
* @extends mungedb-aggregate.pipeline.expressions.Expression
* @constructor
**/
var NaryExpressionBaseT = module.exports = function NaryExpressionBaseT(SubClass) {

	var NaryExpressionBase = function NaryExpressionBase() {
		if (arguments.length !== 0) throw new Error(klass.name + "<" + SubClass.name + ">: zero args expected");
		base.call(this);
	}, klass = NaryExpressionBase, base = NaryExpression, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	klass.parse = function(objExpr, vps) {
		var expr = new SubClass(),
			args = NaryExpression.parseArguments(objExpr, vps);
		expr.validateArguments(args);
		expr.operands = args;
		return expr;
	};

	return NaryExpressionBase;
};
