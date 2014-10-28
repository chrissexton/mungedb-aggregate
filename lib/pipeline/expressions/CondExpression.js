"use strict";

/**
 * $cond expression;  @see evaluate
 * @class CondExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var CondExpression = module.exports = function CondExpression(vars) {
		if (arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, klass = CondExpression,
	base = require("./FixedArityExpression")(klass, 3),
	proto = klass.prototype = Object.create(base.prototype, {
		constructor: {
			value: klass
		}
	});

// DEPENDENCIES
var Value = require("../Value"),
    Expression = require("./Expression");

// PROTOTYPE MEMBERS
klass.opName = "$cond";
proto.getOpName = function getOpName() {
    return klass.opName;
};

klass.parse = function parse(expr, vps) {
	// There may only be one argument - an array of 3 items, or a hash containing 3 keys.
    //this.checkArgLimit(3);

    // if not an object, return;
    if (typeof(expr) !== Object)
		return Expression.parse(expr, vps);

	if(!(klass.opName in expr)) {
		throw new Error("Invalid expression. Expected to see '"+klass.opName+"'");
	}

    var ret = new CondExpression();

	// If this is an Object and not an array, verify all the bits are specified.
	// If this is an Object that is an array, verify there are three bits.
    var args = Expression.parseOperand(expr, vps);
// what is args?  If it is an array of scalars (array mode) or an array of objects (object mode), we're ok.
// In the latter case, I am very not ok with the assuming if, then, and else are in a known order which is
// what the original code implies.  It looks like if we see an 'if' we set this.operands[0]. If we see 'then', we set
// this.operands[1], and if we see 'else' we set operands[2].  Bugcheck on unknown values. Bugcheck on insufficent
// numbers of values, AKA !== 3
    if (args[0] !== "if")
		throw new Error("Missing 'if' parameter to $cond");
    if (args[1] !== "then")
		throw new Error("Missing 'then' parameter to $cond");
    if (args[2] !== "else")
		throw new Error("Missing 'else' parameter to $cond");


    return ret;
};

/**
 * Use the $cond operator with the following syntax:
 * { $cond: { if: <boolean-expression>, then: <true-case>, else: <false-case-> } }
 * -or-
 * { $cond: [ <boolean-expression>, <true-case>, <false-case> ] }
 * @method evaluate
 **/
proto.evaluateInternal = function evaluateInternal(vars) {
		var pCond1 = this.operands[0].evaluateInternal(vars);

		this.idx = 0;
		if (pCond1.coerceToBool()) {
			this.idx = 1;
		} else {
			this.idx = 2;
		}

		return this.operands[this.idx].evaluateInternal(vars);
};

/** Register Expression */
Expression.registerExpression(klass.opName, klass.parse);
