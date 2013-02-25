var CondExpression = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * $cond expression; 
	 *
	 * @see evaluate 
	 *
	 * @class AndExpression
	 * @namespace munge.pipeline.expressions
	 * @module munge
	 * @constructor
	**/
	var klass = module.exports = function CondExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var Value = require("../Value");

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$cond";
	};

	proto.addOperand = function addOperand(expr) {
		this.checkArgLimit(3);
		base.prototype.addOperand.call(this, expr);
	};

	/** 
	* Use the $cond operator with the following syntax:  { $cond: [ <boolean-expression>, <true-case>, <false-case> ] } 
	**/
	proto.evaluate = function evaluate(doc){
		this.checkArgCount(3);
		var pCond = this.operands[0].evaluate(doc),
			idx = Value.coerceToBool(pCond) ? 1 : 2;
		return this.operands[idx].evaluate(doc);
	};

	return klass;
})();
