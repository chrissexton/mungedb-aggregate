var AvgAccumulator = module.exports = (function(){

	// Constructor
	/** 
	* A class for constructing accumulators to calculate avg.
	*
	* @class AvgAccumulator
	* @namespace munge.pipeline.accumulators
	* @module munge
	* @constructor
	**/
	var klass = module.exports = function AvgAccumulator(){
		this.subTotalName = "subTotal";
		this.countName = "count";
		this.totalIsANumber = true;
		base.call(this);
	}, SumAccumulator = require("./SumAccumulator"), base = SumAccumulator, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	proto.getFactory = function getFactory(){
		return klass;	// using the ctor rather than a separate .create() method
	};

	proto.getValue = function getValue(){
		if(this.totalIsANumber && this.count > 0)
			return this.total/this.count;
		else if (this.count === 0)
			return 0;
		else
			throw new Error("$sum resulted in a non-numeric type");
	};

	proto.getOpName = function getOpName(){
		return "$avg";
	};

	return klass;

})();
