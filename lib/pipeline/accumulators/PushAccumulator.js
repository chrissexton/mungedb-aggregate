"use strict";

/** 
 * Constructor for PushAccumulator. Pushes items onto an array.
 * @class PushAccumulator
 * @namespace mungedb-aggregate.pipeline.accumulators
 * @module mungedb-aggregate
 * @constructor
 **/
var PushAccumulator = module.exports = function PushAccumulator(){
	this.values = [];
	base.call(this);
}, klass = PushAccumulator, Accumulator = require("./Accumulator"), base = Accumulator, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

proto.evaluate = function evaluate(doc){
	if (this.operands.length != 1) throw new Error("this should never happen");
	var v = this.operands[0].evaluate(doc);
	if (v !== undefined) this.values.push(v);
	return null;
};

proto.getValue = function getValue(){
	return this.values;
};

proto.getOpName = function getOpName(){
	return "$push";
};
