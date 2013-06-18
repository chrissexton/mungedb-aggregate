"use strict";
var AddToSetAccumulator = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	 * Create an expression that finds the sum of n operands.
	 * @class AddSoSetAccumulator
	 * @namespace munge.pipeline.accumulators
	 * @module munge
	 * @constructor
	**/
	var klass = module.exports = function AddToSetAccumulator(/* pCtx */){
		if(arguments.length !== 0) throw new Error("zero args expected");
		this.set = {};
		//this.itr = undefined; /* Shoudln't need an iterator for the set */
		//this.pCtx = undefined; /* Not using the context object currently as it is related to sharding */
		base.call(this);
	}, Accumulator = require("./Accumulator"), base = Accumulator, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

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
		if (rhs === undefined) return;
		this.set[JSON.stringify(rhs)] = rhs;
	};

	proto.getValue = function getValue() {
		var setValues = [];
		for (var setKey in this.set) {
			setValues.push(this.set[setKey]);
		}
		return setValues;
	};

	return klass;
})();
