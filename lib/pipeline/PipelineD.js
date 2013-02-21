var PipelineD = module.exports = (function(){
	// CONSTRUCTOR
	var klass = function PipelineD(){
		if(this.constructor == PipelineD) throw new Error("Never create instances of this! Use the static helpers only.");
	}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	var DocumentSource = require('./documentSources/DocumentSource'),
		CursorDocumentSource = require('./documentSources/CursorDocumentSource'),
		Cursor = require('../Cursor');
		
	/**
	 * Create a Cursor wrapped in a DocumentSourceCursor, which is suitable
	 * to be the first source for a pipeline to begin with.  This source
	 * will feed the execution of the pipeline.
	 * 
	 * <<Note: Below does not happen in munge>>
	 * This method looks for early pipeline stages that can be folded into
	 * the underlying cursor, and when a cursor can absorb those, they
	 * are removed from the head of the pipeline.  For example, an
	 * early match can be removed and replaced with a Cursor that will
	 * do an index scan.
	 * 
	 * @param {Pipeline}	pPipeline the logical "this" for this operation
	 * @param {Array}	db the data we are going to be munging
	 * @returns {CursorDocumentSource} the cursor that was created
	**/
	klass.prepareCursorSource = function prepareCursorSource(pPipeline, db){
	
        var sources = pPipeline.sourceVector;

		//note that this is a deviation from the mongo implementation to facilitate pipeline reuse
		sources.forEach(function(source){
			source.reset();
		});

		//TODO: should this go earlier in the execution so that we dont need to do it every time?
        var projection = {};
        var deps = {};
        var status = DocumentSource.GetDepsReturn.SEE_NEXT;
        for (var i=0; i < sources.length && status == DocumentSource.GetDepsReturn.SEE_NEXT; i++) {
            status = sources[i].getDependencies(deps);
        }
        if (status == DocumentSource.GetDepsReturn.EXHAUSTIVE) {
            projection = DocumentSource.depsToProjection(deps);
        }

        var cursorWithContext = new CursorDocumentSource.CursorWithContext( );

        cursorWithContext._cursor = new Cursor( db );

        /* wrap the cursor with a DocumentSource and return that */
        var source = new CursorDocumentSource( cursorWithContext );
        
        if (projection && Object.keys(projection).length)
            source.setProjection(projection);

        return source;
	};

	return klass;
})();