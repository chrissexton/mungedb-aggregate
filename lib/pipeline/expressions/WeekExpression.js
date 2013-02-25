var WeekExpression = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	 * A $week pipeline expression.
	 *
	 * @see evaluate 
	 * @class WeekExpression
	 * @namespace munge.pipeline.expressions
	 * @module munge
	 * @constructor
	**/
	var klass = function WeekExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var Value = require("../Value"),
		DayOfYearExpression = require("./DayOfYearExpression");

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$week";
	};

	proto.addOperand = function addOperand(expr) {
		this.checkArgLimit(1);
		base.prototype.addOperand.call(this, expr);
	};

	/** 
	* Takes a date and returns the week of the year as a number between 0 and 53. 
	* Weeks begin on Sundays, and week 1 begins with the first Sunday of the year. 
	* Days preceding the first Sunday of the year are in week 0. 
	* This behavior is the same as the “%U” operator to the strftime standard library function.
	**/
	proto.evaluate = function evaluate(doc) {
		this.checkArgCount(1);
		var date = this.operands[0].evaluate(doc),
			dayOfWeek = date.getDay(),
			dayOfYear = DayOfYearExpression.getDateDayOfYear(date),
			prevSundayDayOfYear = dayOfYear - dayOfWeek,	// may be negative
			nextSundayDayOfYear = prevSundayDayOfYear + 7;	// must be positive
        // Return the zero based index of the week of the next sunday, equal to the one based index of the week of the previous sunday, which is to be returned.
		return (nextSundayDayOfYear / 7) | 0; // also, the `| 0` here truncates this so that we return an integer
	};

	return klass;
})();
