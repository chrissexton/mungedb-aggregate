"use strict";
var FirstAccumulator = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	* Constructor for FirstAccumulator, wraps SingleValueAccumulator's constructor and
	* adds flag to track whether we have started or not
	*
	* @class FirstAccumulator
	* @namespace munge.pipeline.accumulators
	* @module munge
	* @constructor
	**/
	var klass = module.exports = function FirstAccumulator(){
		base.call(this);
		this.started = 0; //TODO: hack to get around falsy values making us keep going
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
		if (this.operands.length != 1) throw new Error("this should never happen");

		/* only remember the first value seen */
		if (!base.prototype.getValue.call(this) && this.started === 0) {
			this.value = this.operands[0].evaluate(doc);
			this.started = 1;
		}

		return this.value;
	};

	return klass;
})();
