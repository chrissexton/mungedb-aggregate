"use strict";
var PipelineCommand = require('./commands/PipelineCommand');

var Aggregator = module.exports = (function(){
	// CONSTRUCTOR
	var base = Object, proto, klass = function Aggregator(ops){
		if (!ops){
			throw new Error("mungedb Aggregator requires a pipeline!");
		}
		if (typeof ops.length !== "number"){
			ops = [ops];
		}
		this.pipeline = new PipelineCommand(ops);
	};
	proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.execute = function execute(inputs){
		var result = {};
		result.ok = this.pipeline.run(inputs, result);
		//return result;	//TODO: figure out if we want mongo style result or a simpler one.
		return result.result;
	};

	//Expose these so that mungedb-aggregate can be extended.
	klass.pipeline = require("./pipeline/Pipeline");
	klass.accumulators = require("./pipeline/accumulators");
	klass.documentSources = require("./pipeline/documentSources");
	klass.expressions = require("./pipeline/expressions");
	klass.Cursor = require("./Cursor");

	return klass;
})();
