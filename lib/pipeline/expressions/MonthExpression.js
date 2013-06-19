"use strict";
var MonthExpression = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	 * A $month pipeline expression. 
	 *
	 * @see evaluate 
	 * @class MonthExpression
	 * @namespace mungedb.aggregate.pipeline.expressions
	 * @module mungedb-aggregate
	 * @constructor
	 **/
	var klass = function MonthExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});
		
	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$month";
	};

	proto.addOperand = function addOperand(expr) {
		this.checkArgLimit(1);
		base.prototype.addOperand.call(this, expr);
	};

	/**
	 * Takes a date and returns the month as a number between 1 and 12.
	 * @method evaluate
	 **/
	proto.evaluate = function evaluate(doc){
		this.checkArgCount(1);
		var date = this.operands[0].evaluate(doc);
		return date.getUTCMonth() + 1;
	};

	return klass;
})();
