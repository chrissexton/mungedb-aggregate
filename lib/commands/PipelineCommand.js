var PipelineCommand = module.exports = (function(){
	// CONSTRUCTOR
	var klass = function PipelineCommand(cmdObj){
        /* try to parse the command; if this fails, then we didn't run */
        
        //NOTE: this is different from the mongo implementation.  It used to be in the 'run' method that we would parse the pipeline, 
        //but we decided it would be better to be able to save the parsed command
        this.pPipeline = Pipeline.parseCommand(cmdObj);
	}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	var Pipeline = require('../pipeline/Pipeline'),
		PipelineD = require('../pipeline/PipelineD');

	/**
	 * Execute the pipeline.
	**/
	proto.executePipeline = function executePipeline(result, pPipeline, pSource){
		return pPipeline.run(result, pSource);
	};
	
	/**
	 * Documents are retrieved until the
	 * cursor is exhausted (or another termination condition occurs).
	**/
	proto.runExecute = function runExecute(result, db){
		var pSource = PipelineD.prepareCursorSource(this.pPipeline, db);
        return this.executePipeline(result, this.pPipeline, pSource);
	};
	
	/**
	 * run the command
	**/
	proto.run = function run(db, result){
		if (!this.pPipeline){
			return false;
		}
        return this.runExecute(result, db);
	};

	return klass;
})();