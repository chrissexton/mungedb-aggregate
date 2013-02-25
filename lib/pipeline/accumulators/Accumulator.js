var Accumulator = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	* A base class for all pipeline accumulators. Uses NaryExpression as a base class.
	*
	* @class Accumulator
	* @namespace munge.pipeline.accumulators
	* @module munge
	* @constructor
	**/
	var klass = function Accumulator(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("../expressions/NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	// var Value = require("../Value"),

	proto.getFactory = function getFactory(){
		return klass;	// using the ctor rather than a separate .create() method
	};

	/**
	* Adds the operand after checking the current limit
	* The equal is there because it checks *before* adding the requested argument.
	* Cannot use checkArgLimit because Accumulator must return a different error code.
	*
	* @param expr the operand to add
	**/
	proto.addOperand = function addOperand(expr) {
		if (this.operands.length >= 1) throw new Error("code 15943; group accumulator " + this.getOpName() + " only accepts one operand");
		base.prototype.addOperand.call(this, expr);
	};

	/**
	*   Convenience method for doing this for accumulators.  The pattern
	*   is always the same, so a common implementation works, but requires
	*   knowing the operator name.
	*
	*   @param {Object} pBuilder the builder to add to
	*   @param {String} fieldName the projected name
	*   @param {String} opName the operator name
	*   @param {Boolean} requireExpression pass down if the expression is needed
	**/
	proto.opToBson = function opToBson(pBuilder, opName, fieldName, requireExpression) {
		if (this.operands.length == 1) throw new Error("this should never happen");
		var builder = new BSONObjBuilder();
		this.operands[0].addToBsonObj(builder, opName, requireExpression);
		pBuilder.append(fieldName, builder.done());
	};

	/**
	*   Wrapper around opToBson
	*
	*   @param {Object} pBuilder the builder to add to
	*   @param {String} fieldName the projected name
	*   @param {Boolean} requireExpression pass down if the expression is needed
	**/
	proto.addToBsonObj = function addToBsonObj(pBuilder, fieldName, requireExpression) {
		this.opToBson(pBuilder, this.getOpName(), fieldName, requireExpression);
	};

	/**
	*   Make sure that nobody adds an accumulator to an array
	*
	*   @param {Object} pBuilder the builder to add to
	**/
	proto.addToBsonArray = function addToBsonArray(pBuilder) {
		if (false) throw new Error("this should never happen"); // these can't appear in arrays
	};

	/** 
	* If this function is not overridden in the sub classes,
	* then throw an error
	*
	**/
	proto.getValue = function getValue() {
		throw new Error("You need to define this function on your accumulator");
	};

	return klass;
})();
