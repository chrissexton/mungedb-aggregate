"use strict";
var MinMaxAccumulator = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	 * Constructor for MinMaxAccumulator, wraps SingleValueAccumulator's constructor and adds flag to track whether we have started or not
	 * @class MinMaxAccumulator
	 * @namespace munge.pipeline.accumulators
	 * @module munge
	 * @constructor
	 **/
	var klass = module.exports = function MinMaxAccumulator(sense){
		if(arguments.length > 1 ) throw new Error("expects a single value");
		base.call(this);
		this.sense = sense; /* 1 for min, -1 for max; used to "scale" comparison */
		if ((this.sense !== 1) && (this.sense !== -1)) throw new Error("this should never happen");
	}, base = require("./SingleValueAccumulator"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var Value = require("../Value");

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		if (this.sense == 1) return "$min";
		return "$max";
	};

	klass.createMin = function createMin(){
		return new MinMaxAccumulator(1);
	};

	klass.createMax = function createMax(){
		return new MinMaxAccumulator(-1);
	};

	/** 
	 * Takes a document and returns the first value in the document
	 * @param {Object} doc the document source
	 * @return the first value
	 **/
	proto.evaluate = function evaluate(doc){
		if (this.operands.length != 1) throw new Error("this should never happen");
		var prhs = this.operands[0].evaluate(doc);

		/* if this is the first value, just use it */
		if (!this.hasOwnProperty('value')) {
			this.value = prhs;
		} else {
			/* compare with the current value; swap if appropriate */
			var cmp = Value.compare(this.value, prhs) * this.sense;
			if (cmp > 0) this.value = prhs;
		}

		return this.value;
	};

	return klass;
})();
