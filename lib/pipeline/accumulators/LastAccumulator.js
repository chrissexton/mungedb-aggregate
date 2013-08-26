"use strict";

/** 
 * Constructor for LastAccumulator, wraps SingleValueAccumulator's constructor and finds the last document
 * @class LastAccumulator
 * @namespace mungedb-aggregate.pipeline.accumulators
 * @module mungedb-aggregate
 * @constructor
 **/
var LastAccumulator = module.exports = function LastAccumulator(){
	base.call(this);
}, klass = LastAccumulator, SingleValueAccumulator = require("./SingleValueAccumulator"), base = SingleValueAccumulator, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

proto.evaluate = function evaluate(doc){
	if (this.operands.length != 1) throw new Error("this should never happen");
	this.value = this.operands[0].evaluate(doc);
};

proto.getOpName = function getOpName(){
	return "$last";
};
