var WeekExpression = module.exports = (function(){
	// CONSTRUCTOR
	/** A $week pipeline expression. @see evaluate **/
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
		base.addOperand(expr);
	};

	/** Takes a date and returns the week of the year as a number between 0 and 53. **/
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
