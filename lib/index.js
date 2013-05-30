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
	aggregate.version = 'r2.4.0-rc0'; // cb8efcd6a2f05d35655ed9f9b947cc4a99ade8db version of mongo built against
	return aggregate;
})();
