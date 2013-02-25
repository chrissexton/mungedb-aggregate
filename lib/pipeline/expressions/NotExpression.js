var NotExpression = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	* An $not pipeline expression. 
	*
	* @see evaluate 
	 * @class NotExpression
	 * @namespace munge.pipeline.expressions
	 * @module munge
	 * @constructor
	**/
	var klass = function NotExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var Value = require("../Value");

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$not";
	};

	proto.addOperand = function addOperand(expr) {
		this.checkArgLimit(1);
		base.prototype.addOperand.call(this, expr);
	};

	/** 
	* Returns the boolean opposite value passed to it. When passed a true value, $not returns false; when passed a false value, $not returns true. 
	**/
	proto.evaluate = function evaluate(doc){
		this.checkArgCount(1);
		var op = this.operands[0].evaluate(doc);
		return !Value.coerceToBool(op);
	};

	return klass;
})();
