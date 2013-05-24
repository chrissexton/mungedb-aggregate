"use strict";
var PipelineCommand = require('./commands/PipelineCommand');

var Aggregator = module.exports = (function(){
	// CONSTRUCTOR
	var base = Object, proto, klass = function Aggregator(docSrcs, pipelineArgs){
		if (!docSrcs){
			throw new Error("mungedb Aggregator requires a pipeline!");
		}
		if (typeof docSrcs.length !== "number"){
			docSrcs = [docSrcs];
		}
		this.pipeline = new PipelineCommand(docSrcs, pipelineArgs);
	};
	proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.execute = function execute(inputs, callback){
		this.pipeline.run(inputs,function(err, result){
			//return result;	//TODO: figuere out if we want mongo style result or a simpler one.
			return callback(err, result);
		});

	};

	//Expose these so that mungedb-aggregate can be extended.
	klass.Pipeline = require("./pipeline/Pipeline");
	klass.accumulators = require("./pipeline/accumulators");
	klass.documentSources = require("./pipeline/documentSources");
	klass.expressions = require("./pipeline/expressions");
	klass.commands = require("./commands");
	klass.Cursor = require("./Cursor");

	return klass;
})();
