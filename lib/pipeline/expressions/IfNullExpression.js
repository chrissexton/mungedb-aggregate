var IfNullExpression = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	* An $ifNull pipeline expression. @see evaluate 
	**/
	var klass = function IfNullExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$ifNull";
	};

	proto.addOperand = function addOperand(expr) {
		this.checkArgLimit(2);
		base.prototype.addOperand.call(this, expr);
	};

	/**
	* Use the $ifNull operator with the following syntax: { $ifNull: [ <expression>, <replacement-if-null> ] } 
	**/
	proto.evaluate = function evaluate(doc){
		this.checkArgCount(2);
		var left = this.operands[0].evaluate(doc);
		if(left !== undefined && left !== null) return left;
		var right = this.operands[1].evaluate(doc);
		return right;
	};

	return klass;
})();