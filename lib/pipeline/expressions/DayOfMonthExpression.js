var DayOfMonthExpression = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * Get the DayOfMonth from a date.
	 *
	 * @class DayOfMonthExpression
	 * @namespace munge.pipeline.expressions
	 * @module munge
	 * @constructor
	**/
	var klass = function DayOfMonthExpression(){
		if (arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$dayOfMonth";
	};

	proto.addOperand = function addOperand(expr) {
		this.checkArgLimit(1);
		base.prototype.addOperand.call(this, expr);
	};

	/** Takes a date and returns the day of the month as a number between 1 and 31. **/
	proto.evaluate = function evaluate(doc){
		this.checkArgCount(1);
		var date = this.operands[0].evaluate(doc);
		return date.getDate() + 1;
	};

	return klass;
})();
