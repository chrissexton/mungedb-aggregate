"use strict";

/**
 * This isn't a finished accumulator, but rather a convenient base class
 * for others such as $first, $last, $max, $min, and similar.  It just
 * provides a holder for a single Value, and the getter for that.  The
 * holder is protected so derived classes can manipulate it.
 *
 * @class SingleValueAccumulator
 * @namespace mungedb-aggregate.pipeline.accumulators
 * @module mungedb-aggregate
 * @constructor
**/
var SingleValueAccumulator = module.exports = function SingleValueAccumulator(){
	if (arguments.length > 1) throw new Error("expects a single value");
	base.call(this);
}, klass = SingleValueAccumulator, Accumulator = require("./Accumulator"), base = Accumulator, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

// DEPENDENCIES
var Value = require("../Value");

proto.getValue = function getValue(){
	return this.value;
};
