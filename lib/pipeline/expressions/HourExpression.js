"use strict";
var HourExpression = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	 * An $hour pipeline expression. 
	 *
	 * @see evaluate 
	 * @class HourExpression
	 * @namespace mungedb.aggregate.pipeline.expressions
	 * @module mungedb-aggregate
	 * @constructor
	 **/
	var klass = function HourExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$hour";
	};

	proto.addOperand = function addOperand(expr) {
		this.checkArgLimit(1);
		base.prototype.addOperand.call(this, expr);
	};

	/** 
	 * Takes a date and returns the hour between 0 and 23. 
	 * @method evaluate
	 **/
	proto.evaluate = function evaluate(doc){
		this.checkArgCount(1);
		var date = this.operands[0].evaluate(doc);
		return date.getUTCHours();
	};

	return klass;
})();
