var DayOfYearExpression = module.exports = (function(){
	// CONSTRUCTOR
	var klass = function DayOfYearExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$dayOfYear";
	};

	proto.addOperand = function addOperand(expr) {
		this.checkArgLimit(1);
		base.prototype.addOperand.call(this, expr);
	};

	/** Takes a date and returns the day of the year as a number between 1 and 366. **/
	proto.evaluate = function evaluate(doc){
		//NOTE: the below silliness is to deal with the leap year scenario when we should be returning 366
		this.checkArgCount(1);
		var date = this.operands[0].evaluate(doc);
		return klass.getDateDayOfYear(date);
	};

	// STATIC METHODS
	klass.getDateDayOfYear = function getDateDayOfYear(d){
		var y11 = new Date(d.getFullYear(), 0, 0),	// same year, first month, first year; time omitted
			ymd = new Date(d.getFullYear(), d.getMonth(), d.getDate());	// same y,m,d; time omitted
		return Math.ceil((y11 - ymd) / 86400000);	//NOTE: 86400000 ms is 1 day
	};

	return klass;
})();
