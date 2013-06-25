"use strict";

/**
 * Used to aggregate `inputs` using a MongoDB-style `pipeline`
 *
 * If `inputs` is given, it will run the `inputs` through the `pipeline` and call the `callback` with the results.
 * If `inputs` is omitted, it will return an "aggregator" function so you can reuse the given `pipeline` against various `inputs`.
 *
 * NOTE: you should be mindful about reusing the same `pipeline` against disparate `inputs` because document coming in can alter the state of it's `DocumentSource`s
 *
 * @method aggregate
 * @namespace mungedb
 * @module mungedb-aggregate
 * @param pipeline  {Array}  The list of pipeline document sources in JSON format
 * @param [inputs]  {Array}  Optional inputs to pass through the `docSrcs` pipeline
 * @param callback               {Function}                                 Called when done
 * @param   callback.err           {Error}                                    The Error if one occurred
 * @param   callback.docs          {Array}                                    The resulting documents
 **/
exports = module.exports = function aggregate(pipeline, inputs, callback) {	// function-style interface; i.e., return the utility function directly as the require
	var ctx = {}, //not used yet
		pipelineInst = exports.pipeline.Pipeline.parseCommand({
			pipeline: pipeline
		}, ctx),
		aggregator = function aggregator(inputs, callback) {
			if (!callback) throw new Error("arg `callback` is required");
			if (!inputs) return callback("arg `inputs` is required");

			// rebuild the pipeline on subsequent calls
			if (!pipelineInst) {
				pipelineInst = exports.pipeline.Pipeline.parseCommand({
					pipeline: pipeline
				}, ctx);
			}

			// use or build input src
			var src;
			if(inputs instanceof exports.pipeline.documentSources.DocumentSource){
				src = inputs;
			}else{
				try{
					pipelineInst.collectionName = inputs;	//NOTE: use the given `inputs` directly; not really a "name" but we don't really have collection names in mungedb-aggregate
					src = exports.pipeline.PipelineD.prepareCursorSource(pipelineInst, pipelineInst.ctx);
				}catch(err){
					return callback(err);
				}
			}

			// run the pipeline against the input src
			return pipelineInst.run(src, function aggregated(err, results){
				pipelineInst = null; // unset so that subsequent calls can rebuild the pipeline
				if(err) return callback(err);
				return callback(null, results.result);
			});
		};
	if(inputs) return aggregator(inputs, callback);
	return aggregator;
};

// package-style interface; i.e., return a function underneath of the require
exports.aggregate = exports;

//Expose these so that mungedb-aggregate can be extended.
exports.Cursor = require("./Cursor");
exports.pipeline = require("./pipeline/");

// version info
exports.version = "r2.4.0-rc0";
exports.gitVersion = "cb8efcd6a2f05d35655ed9f9b947cc4a99ade8db";
