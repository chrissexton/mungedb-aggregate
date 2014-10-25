"use strict";

/**
 * The base class for all n-ary `Expression`s
 * @class NaryExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @extends mungedb-aggregate.pipeline.expressions.Expression
 * @constructor
 **/
var Expression = require("./Expression"),
	Variables = require("./Variables");

var NaryExpressionT = module.exports = function NaryExpressionT(SubClass) {

	var NaryExpression = function NaryExpression(){
		if (arguments.length !== 0) throw new Error("Zero args expected");
		this.operands = [];
		base.call(this);
	}, klass = NaryExpression, base = Expression, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	klass.parseArguments = function(exprElement, vps) {
		var out = [];
		if(exprElement instanceof Array) {
			for(var ii = 0; ii < exprElement.length; ii++) {
				out.push(Expression.parseOperand(exprElement[ii], vps));
			}
		} else {
			out.push(Expression.parseOperand(exprElement, vps));
		}
		return out;
	};

	klass.parse = function(expr, vps) {
		var outExpr = new SubClass(),
			args = NaryExpression.parseArguments(expr, vps);
		outExpr.validateArguments(args);
		outExpr.operands = args;
		return outExpr;
	};

	proto.optimize = function optimize(){
		var n = this.operands.length,
			constCount = 0;

		// optimize sub-expressions and count constants
		for(var ii = 0; ii < n; ii++) {
			var optimized = this.operands[ii].optimize();

			// substitute the optimized expression
			this.operands[ii] = optimized;

			// check to see if the result was a constant
			if(optimized instanceof ConstantExpression) {
				constCount++;
			}
		}

		// If all the operands are constant, we can replace this expression with a constant. Using
		// an empty Variables since it will never be accessed.
		if(constCount === n) {
			var emptyVars = new Variables(),
				result = this.evaluateInternal(emptyVars),
				replacement = new ConstantExpression(result);
			return replacement;
		}

		// Remaining optimizations are only for associative and commutative expressions.
		if(!this.isAssociativeAndCommutative()) {
			return this;
		}

		// Process vpOperand to split it into constant and nonconstant vectors.
		// This can leave vpOperand in an invalid state that is cleaned up after the loop.
		var constExprs = [],
			nonConstExprs = [];
		for(var i=0; i<this.operands.length; i++) { // NOTE: vpOperand grows in loop
			var expr = this.operands[i];
			if(expr instanceof ConstantExpression) {
				constExprs.push(expr);
			} else {
				// If the child operand is the same type as this, then we can
				// extract its operands and inline them here because we know
				// this is commutative and associative.  We detect sameness of
				// the child operator by checking for equality of the opNames
				var nary = expr;
				if(!(nary instanceof NaryExpression) || nary.getOpName() !== this.getOpName) {
					nonConstExprs.push(expr);
				} else {
					// same expression, so flatten by adding to vpOperand which
					// will be processed later in this loop.
					for(var j=0; j<nary.operands.length; j++) {
						this.operands.push(nary.operands[j]);
					}
				}
			}
		}

		// collapse all constant expressions (if any)
		var constValue;
		if(constExprs.length > 0) {
			this.operands = constExprs;
			var emptyVars = new Variables();
			constValue = this.evaluateInternal(emptyVars);
		}

		// now set the final expression list with constant (if any) at the end
		this.operands = nonConstExprs;
		if (constExprs.length > 0) {
			this.operands.push(new ConstantExpression(constValue));
		}

		return this;
	};

	// DEPENDENCIES
	var ConstantExpression = require("./ConstantExpression");

	proto.getOpName = function getOpName(doc){
		throw new Error("NOT IMPLEMENTED BY INHERITOR");
	};

	proto.addDependencies = function addDependencies(deps, path){
		for(var i = 0, l = this.operands.length; i < l; ++i)
			this.operands[i].addDependencies(deps);
	};

	/**
	 * Add an operand to the n-ary expression.
	 * @method addOperand
	 * @param pExpression the expression to add
	 **/
	proto.addOperand = function addOperand(expr) {
		this.operands.push(expr);
	};

	proto.isAssociativeAndCommutative = function isAssociativeAndCommutative() {
		return false;
	};

	proto.serialize = function serialize(explain) {
		var nOperand = this.operands.length,
			array = [];

		for(var i=0; i<nOperand; i++){
			array.push(this.operands[i].serialize(explain));
		}

		var obj = {};
		obj[this.getOpName()] = array;
		return obj;
	};

	proto.validateArguments = function(args) {
		if(this.nargs !== args.length) {
			throw new Error("Expression " + this.getOpName() + " takes exactly " + this.nargs + " arguments. " + args.length + " were passed in.");
		}
	};

	return NaryExpression;
};

