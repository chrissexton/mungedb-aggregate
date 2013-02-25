var DayOfWeekExpression = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * Get the DayOfWeek from a date.
	 *
	 * @class DayOfWeekExpression
	 * @namespace munge.pipeline.expressions
	 * @module munge
	 * @constructor
	**/
	var klass = function DayOfWeekExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$dayOfWeek";
	};

	proto.addOperand = function addOperand(expr) {
		this.checkArgLimit(1);
		base.prototype.addOperand.call(this, expr);
	};

	/** Takes a date and returns the day of the week as a number between 1 (Sunday) and 7 (Saturday.) **/
	proto.evaluate = function evaluate(doc){
		this.checkArgCount(1);
		var date = this.operands[0].evaluate(doc);
		return date.getDay() + 1;
	};

	return klass;
})();
