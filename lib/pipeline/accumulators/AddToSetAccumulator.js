var AddToSetAccumulator = module.exports = (function(){
	// CONSTRUCTOR
	/** Create an expression that finds the sum of n operands. **/
	var klass = module.exports = function AddToSetAccumulator(/* pCtx */){
		if(arguments.length !== 0) throw new Error("zero args expected");
		this.set = {};
		//this.itr = undefined; /* Shoudln't need an iterator for the set */
		//this.pCtx = undefined; /* Not using the context object currently as it is related to sharding */
		base.call(this);
	}, Accumulator = require("./Accumulator"), base = Accumulator, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var Value = require("../Value");

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$addToSet";
	};

	proto.getFactory = function getFactory(){
		return klass;	// using the ctor rather than a separate .create() method
	};

	proto.evaluate = function evaluate(doc) {
		if(arguments.length !== 1) throw new Error("One and only one arg expected");
		var rhs = this.operands[0].evaluate(doc);
		if ('undefined' != typeof rhs) {
			Value.verifyArray(rhs);
			for(var i=0; i<rhs.length; i++) {
				var key = Value.hashCombine(rhs[i]);
				this.set[key] = rhs[i];
			}
		}
		return undefined;
	};

	proto.getValue = function getValue() {
		var arr = [], n = 0;
		for(var key in this.set){
			if(this.set.hasOwnProperty(key)) arr[n++] = this.set[key];
		}
		return arr;
	};

	return klass;
})();

