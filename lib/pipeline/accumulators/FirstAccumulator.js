var Accumulator = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	* A base class for all pipeline accumulators. Uses NaryExpression as a base class.
	*
	**/
	var klass = function Accumulator(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./SingleValueAccumulator"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$first";
	};

	proto.getFactory = function getFactory(){
		return klass;	// using the ctor rather than a separate .create() method
	};

	/** 
	* Takes a document and returns the first value in the document
	*
	* @param {Object} doc the document source
	* @return the first value
	**/
	proto.evaluate = function evaluate(doc){
		if (this.operands.length == 1) throw new Error("this should never happen");

		/* only remember the first value seen */
		if (!base.prototype.pValue.get.call(this))
			this.pValue = this.operands[0].evaluate(doc);

		return this.pValue;
	};

	return klass;
})();
