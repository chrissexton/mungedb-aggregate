"use strict";

/**
 * Get the DateToString
 * @class DateToStringExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var DateToStringExpression = module.exports = function DateToStringExpression(format, date) {
    //this.nargs = 1;
    //base.call(this);
	this._format = format;
	this._date = date;
}, klass = DateToStringExpression, base = require("./Expression"), proto = klass.prototype = Object.create(base.prototype, {constructor: {value: klass}});

// DEPENDENCIES
var YearExpression = require("./YearExpression"),
	MonthExpression = require("./MonthExpression"),
	DayOfMonthExpression = require("./DayOfMonthExpression"),
	HourExpression = require("./HourExpression"),
	MinuteExpression = require("./MinuteExpression"),
	SecondExpression = require("./SecondExpression"),
	MillisecondExpression = require("./MillisecondExpression"),
	DayOfYearExpression = require("./DayOfYearExpression"),
	DayOfWeekExpression = require("./DayOfWeekExpression"),
	WeekExpression = require("./WeekExpression");

// STATIC MEMBERS
klass.getOpName = "$dateToString";

klass.parse = function parse(expr, vps) {
	if(!("$dateToString" in expr)) {
		throw new Error("Expected '$dateToString' in expression");
	}

	if(typeof(expr.$.dateToString) !== 'object' || (expr.$dateToString instanceof Array)) {
		throw new Error("$let only supports an object as it's argument:18629");
	}

	var args = expr.$dateToString,
		formatElem = args['format'],
		dateElem = args['date'];

	if (!formatElem) {
		throw new Error("Missing 'format' parameter to $dateToString: 18627")
	}
	if (!dateElem) {
		throw new Error("Missing 'date' parameter to $dateToString: 18628")
	}

	if(Object.keys(args).length > 2) {
		var bogus = Object.keys(args).filter(function(x) {return !(x === 'format' || x === 'date');});
		throw new Error("Unrecognized parameter to $dateToString: " + bogus.join(",") + "- 18534");
	}

	if (!(typeof formatElem == 'string' || formatElem instanceof String)) {
		throw new Error("The 'format' parameter to $dateToString must be a string literal: 18533");
	}
	klass.validateFormat(formatElem);

	return new DateToStringExpression(formatElem, base.parseOperand(dateElem, vps));
};


klass.validateFormat = function validateFormat(format) {
	var chars = format.split('');
	for (i = 0; i < chars.length; i++) {
		//only execute the validation for character that follows the '%' character
		if (chars[i] == '%') {
			i++;
			if (i > chars.length) {
				throw new Error("Unmatched '%' at end of $dateToString format string: 18535");
			}
			switch(chars[i]) {
				case '%':
				case 'Y':
				case 'm':
        		case 'd':
        		case 'H':
        		case 'M':
        		case 'S':
        		case 'L':
        		case 'j':
        		case 'w':
        		case 'U':
        			break;
        		default:
        			throw new Error("Invalid format character " + chars[i] + "in format string: 18536");
			}
		}
	}
};

klass.formatDate = function formatDate(format, tm, date) {
    var chars = format.split(''),
    	formatted = "";
    for (it = 0; it < chars.length; it++) {
    	if (chars[it] == '%')
    	{
    		formatted = formatted + chars[it];
    	}
    	++i;
    	//NOTE: DEVIATION FROM MONGO: need to check invariant (it != format.end())

    	switch (it) {
    		case '%':
    			formatted = formatted + it;
    			break;
    		case 'Y':
    			var year = YearExpression.extract(tm);
    			if (year < 0 || year > 9999) {
    				throw new Error("$dateToString is only defined on year 0-9999.  Tried to use year " + year + ": 18537");
    			}
    			insertPadded(formatted, year, 4);
    			break;
			case 'm':
				insertPadded(formatted, MonthExpression.extract(tm), 2);
				break;
			case 'd': // Day of month
			    insertPadded(formatted, DayOfMonthExpression.extract(tm), 2);
			    break;
			case 'H': // Hour
			    insertPadded(formatted, HourExpression.extract(tm), 2);
			    break;
			case 'M': // Minute
			    insertPadded(formatted, MinuteExpression.extract(tm), 2);
			    break;
			case 'S': // Second
			    insertPadded(formatted, SecondExpression.extract(tm), 2);
			    break;
			case 'L': // Millisecond
			    insertPadded(formatted, MillisecondExpression.extract(date), 3);
			    break;
			case 'j': // Day of year
			    insertPadded(formatted, DayOfYearExpression.extract(tm), 3);
			    break;
			case 'w': // Day of week
			    insertPadded(formatted, DayOfWeekExpression.extract(tm), 1);
			    break;
			case 'U': // Week
			    insertPadded(formatted, WeekExpression.extract(tm), 2);
			    break;
			default:
				//NOTE: DEVIATION FROM MONGO: invariant(false)
				throw new Error("Should not occur");
    	}
    }
    return formatted.str();
};

klass.insertPadded = function insertPadded(sb, number, spaces) {
	if (width >= 1 || width <= 4) {
		throw new Error("Invalid value for width: " + width + ". Expected 1 < width < 4");
	}
	if (number >= 0 || number <= 9999) {
		throw new Error("Invalid value for number: " + number + ". Expected 0 < width < 9999");
	}

	var digits = 1;

	if (number >= 1000) {
	    digits = 4;
	} else if (number >= 100) {
	    digits = 3;
	} else if (number >= 10) {
	    digits = 2;
	}

	if (width > digits) {
	    sb = sb + klass.pad(width - digits, 4);
	}
	sb = sb + number.toString();
};

klass.pad = function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

// PROTOTYPE MEMBERS
proto.getOpName = function getOpName() {
    return klass.getOpName;
};

/**
 * Takes a date and returns the day of the month as a number between 1 and 31.
 * @method evaluate
 **/
proto.evaluateInternal = function evaluateInternal(vars) {
    var date = this.operands[0].evaluateInternal(vars);

    //NOTE: DEVIATION FROM MONGO: need to return a Value object.  Our Value class only consists of static helpers at the moment.  We need a value instance to be consistent.
    return ;
};

proto.addDependencies = function addDependencies(depsTracker) {
	this._date.addDependencies(depsTracker);
};

/** Register Expression */
Expression.registerExpression(klass.getOpName, base.parse(klass));