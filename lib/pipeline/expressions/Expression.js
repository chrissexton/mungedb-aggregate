"use strict";

/**
 * A base class for all pipeline expressions; Performs common expressions within an Op.
 *
 * NOTE: An object expression can take any of the following forms:
 *
 *	f0: {f1: ..., f2: ..., f3: ...}
 *	f0: {$operator:[operand1, operand2, ...]}
 *
 * @class Expression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var Expression = module.exports = function Expression(){
	if (arguments.length !== 0) throw new Error("zero args expected");
}, klass = Expression, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

// DEPENDENCIES
var Document = require("../Document");

// NESTED CLASSES
/**
 * Reference to the `mungedb-aggregate.pipeline.expressions.Expression.ObjectCtx` class
 * @static
 * @property ObjectCtx
 **/
var ObjectCtx = Expression.ObjectCtx = (function(){
	// CONSTRUCTOR
	/**
	 * Utility class for parseObject() below. isDocumentOk indicates that it is OK to use a Document in the current context.
	 *
	 * NOTE: deviation from Mongo code: accepts an `Object` of settings rather than a bitmask to help simplify the interface a little bit
	 *
	 * @class ObjectCtx
	 * @namespace mungedb-aggregate.pipeline.expressions.Expression
	 * @module mungedb-aggregate
	 * @constructor
	 * @param opts
	 *	@param [opts.isDocumentOk]	{Boolean}
	 *	@param [opts.isTopLevel]	{Boolean}
	 *	@param [opts.isInclusionOk]	{Boolean}
	 **/
	var klass = function ObjectCtx(opts /*= {isDocumentOk:..., isTopLevel:..., isInclusionOk:...}*/){
		if(!(opts instanceof Object && opts.constructor == Object)) throw new Error("opts is required and must be an Object containing named args");
		for (var k in opts) { // assign all given opts to self so long as they were part of klass.prototype as undefined properties
			if (opts.hasOwnProperty(k) && proto.hasOwnProperty(k) && proto[k] === undefined) this[k] = opts[k];
		}
	}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.isDocumentOk =
	proto.isTopLevel =
	proto.isInclusionOk = undefined;

	return klass;
})();

/**
 * Reference to the `mungedb-aggregate.pipeline.expressions.Expression.OpDesc` class
 * @static
 * @property OpDesc
 **/
var OpDesc = Expression.OpDesc = (function(){
	// CONSTRUCTOR
	/**
	 * Decribes how and when to create an Op instance
	 *
	 * @class OpDesc
	 * @namespace mungedb-aggregate.pipeline.expressions.Expression
	 * @module mungedb-aggregate
	 * @constructor
	 * @param name
	 * @param factory
	 * @param flags
	 * @param argCount
	 **/
	var klass = function OpDesc(name, factory, flags, argCount){
		var firstArg = arguments[0];
		if (firstArg instanceof Object && firstArg.constructor == Object) { //TODO: using this?
			var opts = firstArg;
			for (var k in opts) { // assign all given opts to self so long as they were part of klass.prototype as undefined properties
				if (opts.hasOwnProperty(k) && proto.hasOwnProperty(k) && proto[k] === undefined) this[k] = opts[k];
			}
		} else {
			this.name = name;
			this.factory = factory;
			this.flags = flags || 0;
			this.argCount = argCount || 0;
		}
	}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// STATIC MEMBERS
	klass.FIXED_COUNT = 1;
	klass.OBJECT_ARG = 2;

	// PROTOTYPE MEMBERS
	proto.name =
	proto.factory =
	proto.flags =
	proto.argCount = undefined;

	/**
	 * internal `OpDesc#name` comparer
	 * @method cmp
	 * @param that the other `OpDesc` instance
	 **/
	proto.cmp = function cmp(that) {
		return this.name < that.name ? -1 : this.name > that.name ? 1 : 0;
	};

	return klass;
})();
// END OF NESTED CLASSES
/**
 * @class Expression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 **/

var kinds = {
	UNKNOWN: "UNKNOWN",
	OPERATOR: "OPERATOR",
	NOT_OPERATOR: "NOT_OPERATOR"
};


// STATIC MEMBERS
/**
 * Enumeration of comparison operators.  These are shared between a few expression implementations, so they are factored out here.
 *
 * @static
 * @property CmpOp
 **/
klass.CmpOp = {
	EQ: "$eq",		// return true for a == b, false otherwise
	NE: "$ne",		// return true for a != b, false otherwise
	GT: "$gt",		// return true for a > b, false otherwise
	GTE: "$gte",	// return true for a >= b, false otherwise
	LT: "$lt",		// return true for a < b, false otherwise
	LTE: "$lte",	// return true for a <= b, false otherwise
	CMP: "$cmp"		// return -1, 0, 1 for a < b, a == b, a > b
};

// DEPENDENCIES (later in this file as compared to others to ensure that the required statics are setup first)
var FieldPathExpression = require("./FieldPathExpression"),
	ObjectExpression = require("./ObjectExpression"),
	ConstantExpression = require("./ConstantExpression"),
	CompareExpression = require("./CompareExpression");

// DEFERRED DEPENDENCIES
/**
 * Expressions, as exposed to users
 *
 * @static
 * @property opMap
 **/
setImmediate(function(){ // Even though `opMap` is deferred, force it to load early rather than later to prevent even *more* potential silliness
	Object.defineProperty(klass, "opMap", {value:klass.opMap});
});
Object.defineProperty(klass, "opMap", {	//NOTE: deferred requires using a getter to allow circular requires (to maintain the ported API)
	configurable: true,
	get: function getOpMapOnce() {
		return Object.defineProperty(klass, "opMap", {
			value: [	//NOTE: rather than OpTable because it gets converted to a dict via OpDesc#name in the Array#reduce() below
				new OpDesc("$add", require("./AddExpression"), 0),
				new OpDesc("$and", require("./AndExpression"), 0),
				new OpDesc("$cmp", CompareExpression.bind(null, Expression.CmpOp.CMP), OpDesc.FIXED_COUNT, 2),
				new OpDesc("$concat", require("./ConcatExpression"), 0),
				new OpDesc("$cond", require("./CondExpression"), OpDesc.FIXED_COUNT, 3),
		//		$const handled specially in parseExpression
				new OpDesc("$dayOfMonth", require("./DayOfMonthExpression"), OpDesc.FIXED_COUNT, 1),
				new OpDesc("$dayOfWeek", require("./DayOfWeekExpression"), OpDesc.FIXED_COUNT, 1),
				new OpDesc("$dayOfYear", require("./DayOfYearExpression"), OpDesc.FIXED_COUNT, 1),
				new OpDesc("$divide", require("./DivideExpression"), OpDesc.FIXED_COUNT, 2),
				new OpDesc("$eq", CompareExpression.bind(null, Expression.CmpOp.EQ), OpDesc.FIXED_COUNT, 2),
				new OpDesc("$gt", CompareExpression.bind(null, Expression.CmpOp.GT), OpDesc.FIXED_COUNT, 2),
				new OpDesc("$gte", CompareExpression.bind(null, Expression.CmpOp.GTE), OpDesc.FIXED_COUNT, 2),
				new OpDesc("$hour", require("./HourExpression"), OpDesc.FIXED_COUNT, 1),
				new OpDesc("$ifNull", require("./IfNullExpression"), OpDesc.FIXED_COUNT, 2),
				new OpDesc("$lt", CompareExpression.bind(null, Expression.CmpOp.LT), OpDesc.FIXED_COUNT, 2),
				new OpDesc("$lte", CompareExpression.bind(null, Expression.CmpOp.LTE), OpDesc.FIXED_COUNT, 2),
				new OpDesc("$minute", require("./MinuteExpression"), OpDesc.FIXED_COUNT, 1),
				new OpDesc("$mod", require("./ModExpression"), OpDesc.FIXED_COUNT, 2),
				new OpDesc("$month", require("./MonthExpression"), OpDesc.FIXED_COUNT, 1),
				new OpDesc("$multiply", require("./MultiplyExpression"), 0),
				new OpDesc("$ne", CompareExpression.bind(null, Expression.CmpOp.NE), OpDesc.FIXED_COUNT, 2),
				new OpDesc("$not", require("./NotExpression"), OpDesc.FIXED_COUNT, 1),
				new OpDesc("$or", require("./OrExpression"), 0),
				new OpDesc("$second", require("./SecondExpression"), OpDesc.FIXED_COUNT, 1),
				new OpDesc("$strcasecmp", require("./StrcasecmpExpression"), OpDesc.FIXED_COUNT, 2),
				new OpDesc("$substr", require("./SubstrExpression"), OpDesc.FIXED_COUNT, 3),
				new OpDesc("$subtract", require("./SubtractExpression"), OpDesc.FIXED_COUNT, 2),
				new OpDesc("$toLower", require("./ToLowerExpression"), OpDesc.FIXED_COUNT, 1),
				new OpDesc("$toUpper", require("./ToUpperExpression"), OpDesc.FIXED_COUNT, 1),
				new OpDesc("$week", require("./WeekExpression"), OpDesc.FIXED_COUNT, 1),
				new OpDesc("$year", require("./YearExpression"), OpDesc.FIXED_COUNT, 1)
			].reduce(function(r,o){r[o.name]=o; return r;}, {})
		}).opMap;
	}
});

/**
 * Parse an Object.  The object could represent a functional expression or a Document expression.
 *
 * An object expression can take any of the following forms:
 *
 *	f0: {f1: ..., f2: ..., f3: ...}
 *	f0: {$operator:[operand1, operand2, ...]}
 *
 * @static
 * @method parseObject
 * @param obj	the element representing the object
 * @param ctx	a MiniCtx representing the options above
 * @returns the parsed Expression
 **/
klass.parseObject = function parseObject(obj, ctx){
	if(!(ctx instanceof ObjectCtx)) throw new Error("ctx must be ObjectCtx");
	var kind = kinds.UNKNOWN,
		expr, // the result
		exprObj; // the alt result
	if (obj === undefined) return new ObjectExpression();
	var fieldNames = Object.keys(obj);
	for (var fc = 0, n = fieldNames.length; fc < n; ++fc) {
		var fn = fieldNames[fc];
		if (fn[0] === "$") {
			if (fc !== 0) throw new Error("the operator must be the only field in a pipeline object (at '" + fn + "'.; code 16410");
			if(ctx.isTopLevel) throw new Error("$expressions are not allowed at the top-level of $project; code 16404");
			kind = kinds.OPERATOR;	//we've determined this "object" is an operator expression
			expr = Expression.parseExpression(fn, obj[fn]);
		} else {
			if (kind === kinds.OPERATOR) throw new Error("this object is already an operator expression, and can't be used as a document expression (at '" + fn + "'.; code 15990");
			if (!ctx.isTopLevel && fn.indexOf(".") != -1) throw new Error("dotted field names are only allowed at the top level; code 16405");
			if (expr === undefined) { // if it's our first time, create the document expression
				if (!ctx.isDocumentOk) throw new Error("document not allowed in this context"); // CW TODO error: document not allowed in this context
				expr = exprObj = new ObjectExpression();
				kind = kinds.NOT_OPERATOR;	//this "object" is not an operator expression
			}
			var fv = obj[fn];
			switch (typeof(fv)) {
			case "object":
				// it's a nested document
				var subCtx = new ObjectCtx({
					isDocumentOk: ctx.isDocumentOk,
					isInclusionOk: ctx.isInclusionOk
				});
				exprObj.addField(fn, Expression.parseObject(fv, subCtx));
				break;
			case "string":
				// it's a renamed field		// CW TODO could also be a constant
				var pathExpr = new FieldPathExpression(Expression.removeFieldPrefix(fv));
				exprObj.addField(fn, pathExpr);
				break;
			case "boolean":
			case "number":
				// it's an inclusion specification
				if (fv) {
					if (!ctx.isInclusionOk) throw new Error("field inclusion is not allowed inside of $expressions; code 16420");
					exprObj.includePath(fn);
				} else {
					if (!(ctx.isTopLevel && fn == Document.ID_PROPERTY_NAME)) throw new Error("The top-level " + Document.ID_PROPERTY_NAME + " field is the only field currently supported for exclusion; code 16406");
					exprObj.excludeId = true;
				}
				break;
			default:
				throw new Error("disallowed field type " + (fv ? fv.constructor.name + ":" : "") + typeof(fv) + " in object expression (at '" + fn + "')");
			}
		}
	}
	return expr;
};

/**
 * Parse a BSONElement Object which has already been determined to be functional expression.
 *
 * @static
 * @method parseExpression
 * @param opName	the name of the (prefix) operator
 * @param obj	the BSONElement to parse
 * @returns the parsed Expression
 **/
klass.parseExpression = function parseExpression(opName, obj) {
	// look for the specified operator
	if (opName === "$const") return new ConstantExpression(obj); //TODO: createFromBsonElement was here, not needed since this isn't BSON?
	var op = klass.opMap[opName];
	if (!(op instanceof OpDesc)) throw new Error("invalid operator " + opName + "; code 15999");

	// make the expression node
	var IExpression = op.factory,	//TODO: should this get renamed from `factory` to `ctor` or something?
		expr = new IExpression();

	// add the operands to the expression node
	if (op.flags & OpDesc.FIXED_COUNT && op.argCount > 1 && !(obj instanceof Array)) throw new Error("the " + op.name + " operator requires an array of " + op.argCount + " operands; code 16019");
	var operand; // used below
	if (obj.constructor === Object) { // the operator must be unary and accept an object argument
		if (!(op.flags & OpDesc.OBJECT_ARG)) throw new Error("the " + op.name + " operator does not accept an object as an operand");
		operand = Expression.parseObject(obj, new ObjectCtx({isDocumentOk: 1}));
		expr.addOperand(operand);
	} else if (obj instanceof Array) { // multiple operands - an n-ary operator
		if (op.flags & OpDesc.FIXED_COUNT && op.argCount !== obj.length) throw new Error("the " + op.name + " operator requires " + op.argCount + " operand(s); code 16020");
		for (var i = 0, n = obj.length; i < n; ++i) {
			operand = Expression.parseOperand(obj[i]);
			expr.addOperand(operand);
		}
	} else { //assume it's an atomic operand
		if (op.flags & OpDesc.FIXED_COUNT && op.argCount != 1) throw new Error("the " + op.name + " operator requires an array of " + op.argCount + " operands; code 16022");
		operand = Expression.parseOperand(obj);
		expr.addOperand(operand);
	}

	return expr;
};

/**
 * Parse a BSONElement which is an operand in an Expression.
 *
 * @static
 * @param pBsonElement the expected operand's BSONElement
 * @returns the parsed operand, as an Expression
 **/
klass.parseOperand = function parseOperand(obj){
	var t = typeof(obj);
	if (t === "string" && obj[0] == "$") { //if we got here, this is a field path expression
		var path = Expression.removeFieldPrefix(obj);
		return new FieldPathExpression(path);
	}
	else if (t === "object" && obj && obj.constructor === Object) return Expression.parseObject(obj, new ObjectCtx({isDocumentOk: true}));
	else return new ConstantExpression(obj);
};

/**
 * Produce a field path string with the field prefix removed.
 * Throws an error if the field prefix is not present.
 *
 * @static
 * @param prefixedField the prefixed field
 * @returns the field path with the prefix removed
 **/
klass.removeFieldPrefix = function removeFieldPrefix(prefixedField) {
	if (prefixedField.indexOf("\0") != -1) throw new Error("field path must not contain embedded null characters; code 16419");
	if (prefixedField[0] !== "$") throw new Error("field path references must be prefixed with a '$' ('" + prefixedField + "'); code 15982");
	return prefixedField.substr(1);
};

/**
 * returns the signe of a number
 *
 * @static
 * @method signum
 * @returns the sign of a number; -1, 1, or 0
 **/
klass.signum = function signum(i) {
	if (i < 0) return -1;
	if (i > 0) return 1;
	return 0;
};


// PROTOTYPE MEMBERS
/**
 * Evaluate the Expression using the given document as input.
 *
 * @method evaluate
 * @returns the computed value
 **/
proto.evaluate = function evaluate(obj) {
	throw new Error("WAS NOT IMPLEMENTED BY INHERITOR!");
};

/**
 * Optimize the Expression.
 *
 * This provides an opportunity to do constant folding, or to collapse nested
 *  operators that have the same precedence, such as $add, $and, or $or.
 *
 * The Expression should be replaced with the return value, which may or may
 *  not be the same object.  In the case of constant folding, a computed
 *  expression may be replaced by a constant.
 *
 * @method optimize
 * @returns the optimized Expression
 **/
proto.optimize = function optimize() {
	throw new Error("WAS NOT IMPLEMENTED BY INHERITOR!");
};

/**
 * Add this expression's field dependencies to the set Expressions are trees, so this is often recursive.
 *
 * Top-level ExpressionObject gets pointer to empty vector.
 * If any other Expression is an ancestor, or in other cases where {a:1} inclusion objects aren't allowed, they get NULL.
 *
 * @method addDependencies
 * @param deps	output parameter
 * @param path	path to self if all ancestors are ExpressionObjects.
 **/
proto.addDependencies = function addDependencies(deps, path) {
	throw new Error("WAS NOT IMPLEMENTED BY INHERITOR!");
};

/**
 * simple expressions are just inclusion exclusion as supported by ExpressionObject
 * @method getIsSimple
 **/
proto.getIsSimple = function getIsSimple() {
	return false;
};

proto.toMatcherBson = function toMatcherBson(){
	throw new Error("WAS NOT IMPLEMENTED BY INHERITOR!");	//verify(false && "Expression::toMatcherBson()");
};
