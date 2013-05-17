"use strict";
var Aggregator = require("./Aggregator");

module.exports = (function(){
	// functional-style interface
	function aggregate(ops, inputs, callback) {
		var aggregator = new Aggregator(ops);
		if(inputs && callback)
			return aggregator.execute(inputs, callback);
		return aggregator.execute.bind(aggregator);
	}
	// package-style interface
	aggregate.Aggregator = Aggregator;
	aggregate.aggregate = aggregate;
	return aggregate;
})();
