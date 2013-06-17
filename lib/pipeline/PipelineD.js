"use strict";
var PipelineD = module.exports = (function(){
	// CONSTRUCTOR
	var klass = function PipelineD(){
		if(this.constructor == PipelineD) throw new Error("Never create instances of this! Use the static helpers only.");
	}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var DocumentSource = require('./documentSources/DocumentSource'),
		CursorDocumentSource = require('./documentSources/CursorDocumentSource'),
		Cursor = require('../Cursor');

	/**
	 * Create a Cursor wrapped in a DocumentSourceCursor, which is suitable to be the first source for a pipeline to begin with.
	 * This source will feed the execution of the pipeline.
	 *
	 * //NOTE: DEVIATION FROM THE MONGO: We don't have special optimized cursors; You could support something similar by overriding `Pipeline#run` to call `DocumentSource#coalesce` on the `inputSource` if you really need it.
	 *
	 * This method looks for early pipeline stages that can be folded into
	 * the underlying cursor, and when a cursor can absorb those, they
	 * are removed from the head of the pipeline.  For example, an
	 * early match can be removed and replaced with a Cursor that will
	 * do an index scan.
	 *
	 * @param pipeline  {Pipeline}  the logical "this" for this operation
	 * @param ctx       {Object}    Context for expressions
	 * @returns	{CursorDocumentSource}	the cursor that was created
	**/
	klass.prepareCursorSource = function prepareCursorSource(pipeline, /*dbName,*/ expCtx){

        var sources = pipeline.sourceVector;

        //NOTE: SKIPPED: look for initial match
        //NOTE: SKIPPED: create a query object

		//Look for an initial simple project; we'll avoid constructing Values for fields that won't make it through the projection
        var projection = {};
        var deps = [];
        var status = DocumentSource.GetDepsReturn.SEE_NEXT;
        for (var i=0; i < sources.length && status != DocumentSource.GetDepsReturn.EXHAUSTIVE; i++) {
            status = sources[i].getDependencies(deps);
        }
        if (status == DocumentSource.GetDepsReturn.EXHAUSTIVE) {
            projection = DocumentSource.depsToProjection(deps);
        }

		//NOTE: SKIPPED: Look for an initial sort
        //NOTE: SKIPPED: Create the sort object

//		//get the full "namespace" name
//		var fullName = dbName + "." + pipeline.collectionName;

        //NOTE: SKIPPED: if(DEV) log messages

		//Create the necessary context to use a Cursor
		//NOTE: SKIPPED: pSortedCursor bit
		//NOTE: SKIPPED: pUnsortedCursor bit
        var cursorWithContext = new CursorDocumentSource.CursorWithContext(/*fullName*/);

        // Now add the Cursor to cursorWithContext
        cursorWithContext._cursor = new Cursor( pipeline.collectionName );

        // wrap the cursor with a DocumentSource and return that
        var source = new CursorDocumentSource( cursorWithContext, expCtx );

//		source.namespace = fullName;

		//NOTE: SKIPPED: Note the query and sort

        if (Object.keys(projection).length) source.setProjection(projection);

        return source;
	};

	return klass;
})();
