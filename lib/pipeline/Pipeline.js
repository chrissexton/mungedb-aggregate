"use strict";
var async = require("async");
var Pipeline = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * mongodb "commands" (sent via db.$cmd.findOne(...)) subclass to make a command.  define a singleton object for it.
	 * @class Pipeline
	 * @namespace mungedb.aggregate.pipeline
	 * @module mungedb-aggregate
	 * @constructor
	 **/
	var klass = function Pipeline(theCtx){
		this.collectionName = null;
		this.sourceVector = null;
		this.explain = false;
		this.splitMongodPipeline = false;
		this.ctx = theCtx;
	}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	var DocumentSource = require("./documentSources/DocumentSource"),
		LimitDocumentSource = require('./documentSources/LimitDocumentSource'),
		MatchDocumentSource = require('./documentSources/MatchDocumentSource'),
		ProjectDocumentSource = require('./documentSources/ProjectDocumentSource'),
		SkipDocumentSource = require('./documentSources/SkipDocumentSource'),
		UnwindDocumentSource = require('./documentSources/UnwindDocumentSource'),
		GroupDocumentSource = require('./documentSources/GroupDocumentSource'),
		SortDocumentSource = require('./documentSources/SortDocumentSource');

	klass.COMMAND_NAME = "aggregate";
	klass.PIPELINE_NAME = "pipeline";
	klass.EXPLAIN_NAME = "explain";
	klass.FROM_ROUTER_NAME = "fromRouter";
	klass.SPLIT_MONGOD_PIPELINE_NAME = "splitMongodPipeline";
	klass.SERVER_PIPELINE_NAME = "serverPipeline";
	klass.MONGOS_PIPELINE_NAME = "mongosPipeline";

	klass.stageDesc = {};//attaching this to the class for test cases
	klass.stageDesc[LimitDocumentSource.limitName] = LimitDocumentSource.createFromJson;
	klass.stageDesc[MatchDocumentSource.matchName] = MatchDocumentSource.createFromJson;
	klass.stageDesc[ProjectDocumentSource.projectName] = ProjectDocumentSource.createFromJson;
	klass.stageDesc[SkipDocumentSource.skipName] = SkipDocumentSource.createFromJson;
	klass.stageDesc[UnwindDocumentSource.unwindName] = UnwindDocumentSource.createFromJson;
	klass.stageDesc[GroupDocumentSource.groupName] = GroupDocumentSource.createFromJson;
	klass.stageDesc[SortDocumentSource.sortName] = SortDocumentSource.createFromJson;

	/**
	 * Create an `Array` of `DocumentSource`s from the given JSON pipeline
	 * // NOTE: DEVIATION FROM MONGO: split out into a separate function to better allow extensions (was in parseCommand)
	 * @static
	 * @method parseDocumentSources
	 * @param pipeline  {Array}  The JSON pipeline
	 * @returns {Array}  The parsed `DocumentSource`s
	 **/
	klass.parseDocumentSources = function parseDocumentSources(pipeline, ctx){
		var sourceVector = [];
		for (var nSteps = pipeline.length, iStep = 0; iStep < nSteps; ++iStep) {
			// pull out the pipeline element as an object
			var pipeElement = pipeline[iStep];
			if (!(pipeElement instanceof Object)) throw new Error("pipeline element " + iStep + " is not an object; code 15942");
			var obj = pipeElement;

			// Parse a pipeline stage from 'obj'.
			if (Object.keys(obj).length !== 1) throw new Error("A pipeline stage specification object must contain exactly one field; code 16435");
			var stageName = Object.keys(obj)[0],
				stageSpec = obj[stageName];

			// Create a DocumentSource pipeline stage from 'stageSpec'.
			var desc = klass.stageDesc[stageName];
			if (!desc) throw new Error("Unrecognized pipeline stage name: '" + stageName + "'; code 16435");

			// Parse the stage
			var stage = desc(stageSpec, ctx);
			if (!stage) throw new Error("Stage must not be undefined!");
			stage.setPipelineStep(iStep);
			sourceVector.push(stage);
		}
		return sourceVector;
	};

	/**
	 * Create a pipeline from the command.
	 * @static
	 * @method parseCommand
	 * @param cmdObj  {Object}  The command object sent from the client
	 * @param   cmdObj.aggregate            {Array}    the thing to aggregate against;	// NOTE: DEVIATION FROM MONGO: expects an Array of inputs rather than a collection name
	 * @param   cmdObj.pipeline             {Object}   the JSON pipeline of `DocumentSource` specs
	 * @param   cmdObj.explain              {Boolean}  should explain?
	 * @param   cmdObj.fromRouter           {Boolean}  is from router?
	 * @param   cmdObj.splitMongodPipeline	{Boolean}  should split?
	 * @param ctx     {Object}  Not used yet in mungedb-aggregate
	 * @returns	{Array}	the pipeline, if created, otherwise a NULL reference
	 **/
	klass.parseCommand = function parseCommand(cmdObj, ctx){
		var pipelineNamespace = require("./"),
			Pipeline = pipelineNamespace.Pipeline,	// using require in case Pipeline gets replaced with an extension
			pipelineInst = new Pipeline(ctx);

		//gather the specification for the aggregation
		var pipeline;
		for(var fieldName in cmdObj){
			var cmdElement = cmdObj[fieldName];
			if(fieldName == klass.COMMAND_NAME)						pipelineInst.collectionName = cmdElement;		//look for the aggregation command
			else if(fieldName == klass.PIPELINE_NAME)				pipeline = cmdElement;							//check for the pipeline of JSON doc srcs
			else if(fieldName == klass.EXPLAIN_NAME)				pipelineInst.explain = cmdElement;				//check for explain option
			else if(fieldName == klass.FROM_ROUTER_NAME)			pipelineInst.fromRouter = cmdElement;			//if the request came from the router, we're in a shard
			else if(fieldName == klass.SPLIT_MONGOD_PIPELINE_NAME)	pipelineInst.splitMongodPipeline = cmdElement;	//check for debug options
			// NOTE: DEVIATION FROM MONGO: Not implementing: "Ignore $auth information sent along with the command. The authentication system will use it, it's not a part of the pipeline."
			else throw new Error("unrecognized field " + JSON.stringify(fieldName));
		}

		/**
		 * If we get here, we've harvested the fields we expect for a pipeline
		 * Set up the specified document source pipeline.
		 **/
		// NOTE: DEVIATION FROM MONGO: split this into a separate function to simplify and better allow for extensions (now in parseDocumentSources)
		var sourceVector = pipelineInst.sourceVector = Pipeline.parseDocumentSources(pipeline, ctx);

		/* if there aren't any pipeline stages, there's nothing more to do */
		if (!sourceVector.length) return pipelineInst;

		/* Move filters up where possible.
		CW TODO -- move filter past projections where possible, and noting corresponding field renaming.
		*/

		/*
		Wherever there is a match immediately following a sort, swap them.
		This means we sort fewer items.  Neither changes the documents in the stream, so this transformation shouldn't affect the result.
		We do this first, because then when we coalesce operators below, any adjacent matches will be combined.
		*/
		for(var srcn = sourceVector.length, srci = 1; srci < srcn; ++srci) {
			var source = sourceVector[srci];
			if (source instanceof MatchDocumentSource) {
				var previous = sourceVector[srci - 1];
				if (previous instanceof SortDocumentSource) {
					/* swap this item with the previous */
					sourceVector[srci - 1] = source;
					sourceVector[srci] = previous;
				}
			}
		}

		/*
		Coalesce adjacent filters where possible.  Two adjacent filters are equivalent to one filter whose predicate is the conjunction of the two original filters' predicates.
		For now, capture this by giving any DocumentSource the option to absorb it's successor; this will also allow adjacent projections to coalesce when possible.
		Run through the DocumentSources, and give each one the opportunity to coalesce with its successor.  If successful, remove the successor.
		Move all document sources to a temporary list.
		*/
		var tempVector = sourceVector.slice(0);
		sourceVector.length = 0;

		// move the first one to the final list
		sourceVector.push(tempVector[0]);

		// run through the sources, coalescing them or keeping them
		for(var tempn = tempVector.length, tempi = 1; tempi < tempn; ++tempi) {
			/*
			If we can't coalesce the source with the last, then move it to the final list, and make it the new last.
			(If we succeeded, then we're still on the same last, and there's no need to move or do anything with the source -- the destruction of tempVector will take care of the rest.)
			*/
			var lastSource = sourceVector[sourceVector.length - 1],
				temp = tempVector[tempi];
			if (!temp || !lastSource) throw new Error("null document sources found");
			if (!lastSource.coalesce(temp)){
				sourceVector.push(temp);
			}
		}

		// optimize the elements in the pipeline
		for(var i = 0, l = sourceVector.length; i<l; i++) {
			var iter = sourceVector[i];
			if (!iter) throw new Error("Pipeline received empty document as argument");
			iter.optimize();
		}

		return pipelineInst;
	};

	/**
	 * Run the pipeline
	 * @method run
	 * @param	inputSource		{DocumentSource}	The input document source for the pipeline
	 * @param	callback		{Function}			The callback function
	**/
	proto.run = function run(inputSource, callback){
		if(inputSource && !(inputSource instanceof DocumentSource)) throw new Error("arg `inputSource` must be an instance of DocumentSource");
		if(!callback) throw new Error("arg `callback` required");
		var self = this;
		inputSource.setSource(undefined, function(err){	//TODO: HACK: temp solution to the fact that we need to initialize our source since we're using setSource as a workaround for the lack of real async cursors
			if(err) return callback(err);
			// chain together the sources we found
			async.eachSeries(self.sourceVector,
				function eachSrc(item, next){
					item.setSource(inputSource, function(err){
						if(err) return next(err);
						inputSource = item;
						return next();
					});
				},
				function doneSrcs(err){ //source is left pointing at the last source in the chain
					if(err) return callback(err);
					/*
					Iterate through the resulting documents, and add them to the result.
					We do this even if we're doing an explain, in order to capture the document counts and other stats.
					However, we don't capture the result documents for explain.
					*/
					// the array in which the aggregation results reside
					var resultArray = [];
					for(var hasDoc = !inputSource.eof(); hasDoc; hasDoc = inputSource.advance()) {
						var document = inputSource.getCurrent();
						resultArray.push(document);	// add the document to the result set

						//Commenting out this assertion for munge.  MUHAHAHA!!!
						// object will be too large, assert. the extra 1KB is for headers
						//if(resultArray.len() < BSONObjMaxUserSize - 1024) throw new Error("aggregation result exceeds maximum document size (" + BSONObjMaxUserSize / (1024 * 1024) + "MB); code 16389");
					}
					var result = {
						result: resultArray
//						,ok: true;	//not actually in here... where does this come from?
					};
					return callback(null, result);
				}
			);
		});
	};

	return klass;
})();
