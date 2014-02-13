"use strict";

/**
 * Generic comparison expression that gets used for $eq, $ne, $lt, $lte, $gt, $gte, and $cmp. 
 * @class CompareExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var CompareExpression = module.exports = function CompareExpression(cmpOp) {
	if (arguments.length !== 1) throw new Error("args expected: cmpOp");
	this.cmpOp = cmpOp;
	base.call(this);
}, klass = CompareExpression, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

// DEPENDENCIES
var Value = require("../Value"),
	Expression = require("./Expression"),
	ConstantExpression = require("./ConstantExpression"),
	FieldPathExpression = require("./FieldPathExpression"),
	FieldRangeExpression = require("./FieldRangeExpression");

// NESTED CLASSES
/**
 * Lookup table for truth value returns
 *
 * @param truthValues	truth value for -1, 0, 1
 * @param reverse		reverse comparison operator
 * @param name			string name
 **/
var CmpLookup = (function(){	// emulating a struct
	// CONSTRUCTOR
	var klass = function CmpLookup(truthValues, reverse, name) {
		if(arguments.length !== 3) throw new Error("args expected: truthValues, reverse, name");
		this.truthValues = truthValues;
		this.reverse = reverse;
		this.name = name;
	}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});
	return klass;
})();

// verify we need this below
// PRIVATE STATIC MEMBERS
/**
 * a table of cmp type lookups to truth values
 * @private
 **/
var cmpLookupMap = [	//NOTE: converted from this Array to a Dict/Object below using CmpLookup#name as the key
	//              -1      0      1      reverse             name     (taking advantage of the fact that our 'enums' are strings below)
	new CmpLookup([false, true, false], CompareExpression.EQ, CompareExpression.EQ),
	new CmpLookup([true, false, true], CompareExpression.NE, CompareExpression.NE),
	new CmpLookup([false, false, true], CompareExpression, CompareExpression.GT),
	new CmpLookup([false, true, true], CompareExpression.LTE, CompareExpression.GTE),
	new CmpLookup([true, false, false], CompareExpression.GT, CompareExpression.LT),
	new CmpLookup([true, true, false], CompareExpression.GTE, CompareExpression.LTE),
	new CmpLookup([false, false, false], CompareExpression.CMP, CompareExpression.CMP)
].reduce(function(r,o){r[o.name]=o;return r;},{});


// PROTOTYPE MEMBERS
proto.evaluateInternal = function evaluateInternal(doc) {
	this.checkArgCount(2);
	var left = this.operands[0].evaluateInternal(doc),
		right = this.operands[1].evaluateInternal(doc),
		cmp = Expression.signum(Value.compare(left, right));
	if (this.cmpOp == Expression.CmpOp.CMP) return cmp;
	return cmpLookupMap[this.cmpOp].truthValues[cmp + 1] || false;
};

klass.EQ = "$eq";
klass.NE = "$ne";
klass.GT = "$gt";
klass.GTE = "$gte";
klass.LT = "$lt";
klass.LTE = "$lte";
klass.CMP = "$cmp";

proto.getOpName = function getOpName(){
	return this.cmpOp;
};
