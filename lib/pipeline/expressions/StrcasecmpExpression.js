var StrcasecmpExpression = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	 * A $strcasecmp pipeline expression.
	 *
	 * @see evaluate 
	 * @class StrcasecmpExpression
	 * @namespace munge.pipeline.expressions
	 * @module munge
	 * @constructor
	**/
	var klass = function StrcasecmpExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});
var Value = require("../Value"),
	NaryExpression = require("./NaryExpression");


	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$strcasecmp";
	};

	proto.addOperand = function addOperand(expr) {
		this.checkArgLimit(2);
		base.prototype.addOperand.call(this, expr);
	};

	/** 
	* Takes in two strings. Returns a number. $strcasecmp is positive if the first string is “greater than” the second and negative if the first string is “less than” the second. $strcasecmp returns 0 if the strings are identical. 
	**/
	proto.evaluate = function evaluate(doc){
		this.checkArgCount(2);
		var val1 = this.operands[0].evaluate(doc),
			val2 = this.operands[1].evaluate(doc),
			str1 = Value.coerceToString(val1).toUpperCase(),
			str2 = Value.coerceToString(val2).toUpperCase(),
			cmp = Value.compare(str1, str2);
		return cmp;
	};

	return klass;
})();
