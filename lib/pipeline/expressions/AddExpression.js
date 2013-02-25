var AddExpression = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	 * Create an expression that finds the sum of n operands. 
	 *
	 * @class AddExpression
	 * @namespace munge.pipeline.expressions
	 * @module munge
	 * @constructor
	**/
	var klass = module.exports = function AddExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, NaryExpression = require("./NaryExpression"), base = NaryExpression, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var Value = require("../Value");

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$add";
	};

	proto.getFactory = function getFactory(){
		return klass;	// using the ctor rather than a separate .create() method
	};

	/** Takes an array of one or more numbers and adds them together, returning the sum. **/
	proto.evaluate = function evaluate(doc) {
		var total = 0;
		for (var i = 0, n = this.operands.length; i < n; ++i) {
			var value = this.operands[i].evaluate(doc);
			if (value instanceof Date) throw new Error("$add does not support dates; code 16415");
			if (typeof(value) == "string") throw new Error("$add does not support strings; code 16416");
			total += Value.coerceToDouble(value);
		}
		if (typeof(total) != "number") throw new Error("$add resulted in a non-numeric type; code 16417");
		return total;
	};

	return klass;
})();
