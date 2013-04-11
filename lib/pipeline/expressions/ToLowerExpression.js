var ToLowerExpression = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	 * A $toLower pipeline expression.
	 *
	 * @see evaluate 
	 * @class ToLowerExpression
	 * @namespace mungedb.aggregate.pipeline.expressions
	 * @module mungedb-aggregate
	 * @constructor
	**/
	var klass = function ToLowerExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var Value = require("../Value");

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$toLower";
	};

	proto.addOperand = function addOperand(expr) {
		this.checkArgLimit(1);
		base.prototype.addOperand.call(this, expr);
	};

	/** 
	* Takes a single string and converts that string to lowercase, returning the result. All uppercase letters become lowercase. 
	**/
	proto.evaluate = function evaluate(doc) {
		this.checkArgCount(1);
		var val = this.operands[0].evaluate(doc),
			str = Value.coerceToString(val);
		return str.toLowerCase();
	};

	return klass;
})();
