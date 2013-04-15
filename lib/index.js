"use strict";
var Aggregator = require("./Aggregator");

module.exports = (function(){
	// functional-style interface
	function aggregate(ops, inputs) {
		var aggregator = new Aggregator(ops);
		if(inputs)
			return aggregator.execute(inputs);
		return aggregator.execute.bind(aggregator);
	}
	// package-style interface
	aggregate.Aggregator = Aggregator;
	aggregate.aggregate = aggregate;
	return aggregate;
})();
