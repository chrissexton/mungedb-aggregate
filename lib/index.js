"use strict";
var Aggregator = require("./Aggregator");

module.exports = (function(){
	function aggregate(ops, inputs) {
		var aggregator = new Aggregator(ops);
		if(inputs)
			return aggregator.execute(inputs);
		return aggregator.execute.bind(aggregator);
	}
	aggregate.Aggregator = Aggregator;
	return aggregate;
})();
