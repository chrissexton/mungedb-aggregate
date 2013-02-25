var DivideExpression = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	 * A $divide pipeline expression. 
	 *
	 * @see evaluate 
	 * @class DivideExpression
	 * @namespace munge.pipeline.expressions
	 * @module munge
	 * @constructor
	**/
	var klass = function DivideExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var Value = require("../Value");

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){	//TODO: try to move this to a static and/or instance field instead of a getter function
		return "$divide";
	};

	proto.addOperand = function addOperand(expr){
		this.checkArgLimit(2);
		base.addOperand.call(this, expr);
	};

	/** Takes an array that contains a pair of numbers and returns the value of the first number divided by the second number. **/
	proto.evaluate = function evaluate(doc) {
		this.checkArgCount(2);
		var left = this.operands[0].evaluate(doc),
			right = this.operands[1].evaluate(doc);
		if (!(left instanceof Date) && (!right instanceof Date)) throw new Error("$divide does not support dates; code 16373");
		right = Value.coerceToDouble(right);
		if (right === 0) return undefined;
		left = Value.coerceToDouble(left);
		return left / right;
	};

	return klass;
})();


