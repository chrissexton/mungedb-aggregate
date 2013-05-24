"use strict";
var PipelineCommand = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * Represents a Pipeline Command
	 *
	 * @class PipelineCommand
	 * @namespace mungedb.aggregate.pipeline
	 * @module mungedb-aggregate
	 * @constructor
	 **/
	var klass = function PipelineCommand(docSrcs, pipelineArgs){
        /* try to parse the command; if this fails, then we didn't run */
        //NOTE: this is different from the mongo implementation.  It used to be in the 'run' method that we would parse the pipeline, 
        //but we decided it would be better to be able to save the parsed command
        this.pPipeline = klass.Pipeline.parseCommand(docSrcs, pipelineArgs);
	}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

    //Put these on the class so they can be overriden.
	klass.Pipeline = require('../pipeline/Pipeline');
	klass.PipelineD = require('../pipeline/PipelineD');

	/**
	 * Execute the pipeline.
	 * @method executePipeline
	 **/
	proto.executePipeline = function executePipeline(pPipeline, pSource, callback){
		return pPipeline.run(pSource, callback);
	};
	
	/**
	 * Documents are retrieved until the cursor is exhausted (or another termination condition occurs).
	 * @method runExecute
	 **/
	proto.runExecute = function runExecute(db, callback){
		var pSource = klass.PipelineD.prepareCursorSource(this.pPipeline, db);
        return this.executePipeline(this.pPipeline, pSource, callback);
	};
	
	/**
	 * run the command
	 * @method run
	 **/
	proto.run = function run(db, callback){
		if (!this.pPipeline){
			return callback(new Error('Pipeline not defined'));
		}
        this.runExecute(db, callback);
	};

	return klass;
})();
