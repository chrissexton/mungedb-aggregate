var Pipeline = module.exports = (function(){
	// CONSTRUCTOR
	var klass = function Pipeline(){
		
		this.sourceVector = [];//should be provate?
		
	}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});
	
//	var GroupDocumentSource = require('./documentSources/GroupDocumentSource'),
//		LimitDocumentSource = require('./documentSources/LimitDocumentSource'),
//		MatchDocumentSource = require('./documentSources/MatchDocumentSource'),
//		ProjectDocumentSource = require('./documentSources/ProjectDocumentSource'),
//		SkipDocumentSource = require('./documentSources/SkipDocumentSource'),
//		SortDocumentSource = require('./documentSources/SortDocumentSource'),
//		UnwindDocumentSource = require('./documentSources/UnwindDocumentSource');
	
	klass.StageDesc = {};//attaching this to the class for test cases
//	StageDesc[GroupDocumentSource.groupName] = GroupDocumentSource;
//	StageDesc[LimitDocumentSource.limitName] = LimitDocumentSource;
//	StageDesc[MatchDocumentSource.matchName] = MatchDocumentSource;
//	StageDesc[ProjectDocumentSource.projectName] = ProjectDocumentSource;
//	StageDesc[SkipDocumentSource.skipName] = SkipDocumentSource;
//	StageDesc[SortDocumentSource.sortName] = SortDocumentSource;
//	StageDesc[UnwindDocumentSource.unwindName] = UnwindDocumentSource;
	
    /**
     * Create a pipeline from the command.
	 *
     * @param	{Object} cmdObj the command object sent from the client
     * @returns	{Array}	the pipeline, if created, otherwise a NULL reference
     **/
	klass.parseCommand = function parseCommand(cmdObj){
		var pipelineInstance = new Pipeline(),
			pipeline = cmdObj;//munge: skipping the command parsing since all we care about is the pipeline
		
		var sourceVector = pipelineInstance.sourceVector,
			nSteps = pipeline.length;
		for( var iStep = 0; iStep<nSteps; ++iStep){
            /* pull out the pipeline element as an object */
			var pipeElement = pipeline[iStep];
			if (!(pipeElement instanceof Object)){
				throw new Error("pipeline element " + iStep + " is not an object; code 15942" );
			}
			
            // Parse a pipeline stage from 'obj'.
			var obj = pipeElement;
			if (Object.keys(obj).length !== 1){
				throw new Error("A pipeline stage specification object must contain exactly one field; code 16435" );
			}
            // Create a DocumentSource pipeline stage from 'stageSpec'.
            var stageName = Object.keys(obj)[0],
				stageSpec = obj[stageName],
				Desc = klass.StageDesc[stageName];
				
			if (!Desc){
				throw new Error("Unrecognized pipeline stage name: '" + stageName + "'; code 16435" );
			}
			
            var stage = new Desc(stageSpec);
            //verify(stage);
            stage.setPipelineStep(iStep);
            sourceVector.push(stage);
		}
		
        /* if there aren't any pipeline stages, there's nothing more to do */
		if (!sourceVector.length){
			return pipelineInstance;
		}
		
		/*
          Move filters up where possible.

          CW TODO -- move filter past projections where possible, and noting
          corresponding field renaming.
        */

        /*
          Wherever there is a match immediately following a sort, swap them.
          This means we sort fewer items.  Neither changes the documents in
          the stream, so this transformation shouldn't affect the result.

          We do this first, because then when we coalesce operators below,
          any adjacent matches will be combined.
         */
        for(var srcn = sourceVector.length, srci = 1; srci < srcn; ++srci) {
            var source = sourceVector[srci];
            if (source.constructor === klass.MatchDocumentSource) { //TODO: remove 'klass.' once match is implemented!!!
                var previous = sourceVector[srci - 1];
                if (previous.constructor === klass.SortDocumentSource) { //TODO: remove 'sort.' once match is implemented!!!
                    /* swap this item with the previous */
                    sourceVector[srci - 1] = source;
                    sourceVector[srci] = previous;
                }
            }
        }
        
		/*
          Coalesce adjacent filters where possible.  Two adjacent filters
          are equivalent to one filter whose predicate is the conjunction of
          the two original filters' predicates.  For now, capture this by
          giving any DocumentSource the option to absorb it's successor; this
          will also allow adjacent projections to coalesce when possible.

          Run through the DocumentSources, and give each one the opportunity
          to coalesce with its successor.  If successful, remove the
          successor.

          Move all document sources to a temporary list.
        */
        var tempVector = sourceVector.slice(0);
        sourceVector.length = 0;

        /* move the first one to the final list */
        sourceVector.push(tempVector[0]);

        /* run through the sources, coalescing them or keeping them */
        for(var tempn = tempVector.length, tempi = 1; tempi < tempn; ++tempi) {
            /*
              If we can't coalesce the source with the last, then move it
              to the final list, and make it the new last.  (If we succeeded,
              then we're still on the same last, and there's no need to move
              or do anything with the source -- the destruction of tempVector
              will take care of the rest.)
            */
            var lastSource = sourceVector[sourceVector.length - 1];
            var temp = tempVector[tempi];
            if (!temp || !lastSource){
				throw new Error("null document sources found");
            }
            if (!lastSource.coalesce(temp)){
                sourceVector.push(temp);
            }
        }

        /* optimize the elements in the pipeline */
        for(var i = 0, l = sourceVector.length; i<l; i++) {
			var iter = sourceVector[i];
            if (!iter) {
                throw new Error("Pipeline received empty document as argument");
            }

            iter.optimize();
        }

        return pipelineInstance;
	};
	/**
	 * Run the pipeline
	 * 
	 * @param	{Object}	result	the results of running the pipeline will be stored on this object
	 * @param	{CursorDocumentSource}	source	the primary document source of the data
	**/
	proto.run = function run(result, source){
		
        for(var i = 0, l = this.sourceVector.length; i<l; i++) {
			var temp = this.sourceVector[i];
            temp.setSource(source);
            source = temp;
        }
        /* source is left pointing at the last source in the chain */

        /*
          Iterate through the resulting documents, and add them to the result.
          We do this even if we're doing an explain, in order to capture
          the document counts and other stats.  However, we don't capture
          the result documents for explain.
          */
        // the array in which the aggregation results reside
        // cant use subArrayStart() due to error handling
        var resultArray = [];
        for(var hasDoc = !source.eof(); hasDoc; hasDoc = source.advance()) {
            var document = source.getCurrent();

            /* add the document to the result set */
            resultArray.push(document);
            
            //Commenting out this assertion for munge.  MUHAHAHA!!!
            
            // object will be too large, assert. the extra 1KB is for headers
//            uassert(16389,
//                    str::stream() << "aggregation result exceeds maximum document size ("
//                                  << BSONObjMaxUserSize / (1024 * 1024) << "MB)",
//                    resultArray.len() < BSONObjMaxUserSize - 1024);
        }

        result.result = resultArray;
        
		return true;
	};
	
	return klass;
})();