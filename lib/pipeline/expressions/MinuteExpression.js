var MinuteExpression = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	 * An $minute pipeline expression. 
	 *
	 * @see evaluate 
	 * @class MinuteExpression
	 * @namespace munge.pipeline.expressions
	 * @module munge
	 * @constructor
	**/
	var klass = function MinuteExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$minute";
	};

	proto.addOperand = function addOperand(expr) {
		this.checkArgLimit(1);
		base.prototype.addOperand.call(this, expr);
	};

	/** 
	* Takes a date and returns the minute between 0 and 59. 
	**/
	proto.evaluate = function evaluate(doc){
		this.checkArgCount(1);
		var date = this.operands[0].evaluate(doc);
		return date.getMinutes();
	};

	return klass;
})();
