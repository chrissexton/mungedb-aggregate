"use strict";

/**
 * Get the DayOfMonth from a date.
 * @class DayOfMonthExpression
 * @namespace mungedb-aggregate.pipeline.expressions
 * @module mungedb-aggregate
 * @constructor
 **/
var DayOfMonthExpression = module.exports = function DayOfMonthExpression() {
    //this.nargs = 1;
    //base.call(this);
}, klass = DayOfMonthExpression, base = require("./FixedArityExpressionT")(klass, 1), proto = klass.prototype = Object.create(base.prototype, {constructor: {value: klass}});

// DEPENDENCIES
var Expression = require("./Expression");

// STATIC MEMBERS
klass.extract = function extract(date) {
    return date.getUTCDate();
};

klass.getOpName = "$dayOfMonth";

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
    return klass.extract(date);
};

/** Register Expression */
Expression.registerExpression(klass.getOpName, base.parse(klass));
