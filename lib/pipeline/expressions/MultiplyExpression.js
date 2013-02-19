var MultiplyExpression = module.exports = (function(){
	// CONSTRUCTOR
	/** A $multiply pipeline expression. @see evaluate **/
	var klass = function MultiplyExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var Value = require("../Value");

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$multiply";
	};

	/** 
	* Takes an array of one or more numbers and multiples them, returning the resulting product. 
	**/
	proto.evaluate = function evaluate(doc){
		var product = 1;
		for(var i = 0, n = this.operands.length; i < n; ++i){
			var value = this.operands[i].evaluate(doc);
			if(value instanceof Date) throw new Error("$multiply does not support dates; code 16375");
			product *= Value.coerceToDouble(value);
		}
		if(typeof(product) != "number") throw new Error("$multiply resulted in a non-numeric type; code 16418");
		return product;
	};

	proto.getFactory = function getFactory(){
		return klass;	// using the ctor rather than a separate .create() method
	};

	return klass;
})();
