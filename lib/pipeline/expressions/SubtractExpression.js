var SubtractExpression = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	* A $subtract pipeline expression. @see evaluate 
	**/
	var klass = function SubtractExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
var Value = require("../Value");

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$subtract";
	};

	proto.addOperand = function addOperand(expr) {
		this.checkArgLimit(2);
		base.prototype.addOperand.call(this, expr);
	};

	/** 
	* Takes an array that contains a pair of numbers and subtracts the second from the first, returning their difference. 
	**/
	proto.evaluate = function evaluate(doc) {
		this.checkArgCount(2);
		var left = this.operands[0].evaluate(doc),
			right = this.operands[1].evaluate(doc);
		if(left instanceof Date || right instanceof Date) throw new Error("$subtract does not support dates; code 16376");
		return left - right;
	};

	return klass;
})();
