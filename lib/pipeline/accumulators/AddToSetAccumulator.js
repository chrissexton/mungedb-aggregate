"use strict";

/** 
 * Create an expression that finds the sum of n operands.
 * @class AddSoSetAccumulator
 * @namespace mungedb-aggregate.pipeline.accumulators
 * @module mungedb-aggregate
 * @constructor
**/
var AddToSetAccumulator = module.exports = function AddToSetAccumulator(/* ctx */){
	if (arguments.length !== 0) throw new Error("zero args expected");
	this.set = {};
	//this.itr = undefined; /* Shoudln't need an iterator for the set */
	//this.ctx = undefined; /* Not using the context object currently as it is related to sharding */
	base.call(this);
}, klass = AddToSetAccumulator, Accumulator = require("./Accumulator"), base = Accumulator, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

proto.processInternal = function processInternal(doc, merging) {
	var set = this.set;
	Object.keys(doc).map(function(d) {
		set[JSON.stringify(doc[d])] = doc[d];
	});
};

proto.getValue = function getValue(toBeMerged) {
	var set = this.set;
	return Object.keys(set).map(function(k) {
		return set[k];
	});
};

proto.reset = function reset() {
    this.set = {};
};

// PROTOTYPE MEMBERS
proto.getOpName = function getOpName(){
	return "$addToSet";
};
