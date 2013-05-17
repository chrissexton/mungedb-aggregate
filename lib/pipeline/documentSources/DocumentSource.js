"use strict";
var DocumentSource = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * A base class for all document sources
	 *
	 * @class DocumentSource
	 * @namespace munge.pipeline.documentsource
	 * @module munge
	 * @constructor
	 * @param	{ExpressionContext}	
	**/
	var klass = module.exports = DocumentSource = function DocumentSource(/*pCtx*/){
		if(arguments.length !== 0) throw new Error("zero args expected");
		
        /*
          Most DocumentSources have an underlying source they get their data
          from.  This is a convenience for them.
          The default implementation of setSource() sets this; if you don't
          need a source, override that to verify().  The default is to
          verify() if this has already been set.
        */
        this.pSource = null;

        /*
          The zero-based user-specified pipeline step.  Used for diagnostics.
          Will be set to -1 for artificial pipeline steps that were not part
          of the original user specification.
         */
        this.step = -1;

		//we dont need this because we are not sharding
        //intrusive_ptr<ExpressionContext> pExpCtx;
		//this.pExpCtx = pCtx;

        /*
          for explain: # of rows returned by this source
          This is *not* unsigned so it can be passed to JSONObjBuilder.append().
         */
        this.nRowsOut = 0;
		
	}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

/*
class DocumentSource :
    public IntrusiveCounterUnsigned,
    public StringWriter {
public:
    virtual ~DocumentSource();

    // virtuals from StringWriter
    virtual void writeString(stringstream &ss) const;
*/

    /**
     * Set the step for a user-specified pipeline step.
     * 
     * @method	setPipelineStep
     * @param	{Number}	step	number 0 to n.
    **/
    proto.setPipelineStep = function setPipelineStep(step) {
		this.step = step;
    };

    /**
     * Get the user-specified pipeline step.
     * 
     * @method	getPipelineStep
     * @returns	{Number}	step
    **/
    proto.getPipelineStep = function getPipelineStep() {
		return this.step;
    };
    
    /**
     * Is the source at EOF?
     * 
     * @method	eof
    **/
    proto.eof = function eof() {
		throw new Error("not implemented");
    };
    
    /**
     * Advance the state of the DocumentSource so that it will return the next Document.  
     * The default implementation returns false, after checking for interrupts. 
     * Derived classes can call the default implementation in their own implementations in order to check for interrupts.
     * 
     * @method	advance
     * @returns	{Boolean}	whether there is another document to fetch, i.e., whether or not getCurrent() will succeed.  This default implementation always returns false.
    **/
    proto.advance = function advance() {
        //pExpCtx->checkForInterrupt(); // might not return
        return false;
    };
    
    /**
     * some implementations do the equivalent of verify(!eof()) so check eof() first
     * 
     * @method	getCurrent
     * @returns	{Document}	the current Document without advancing
    **/
    proto.getCurrent = function getCurrent() {
		throw new Error("not implemented");
    };

    /**
     * Inform the source that it is no longer needed and may release its resources.  After
     * dispose() is called the source must still be able to handle iteration requests, but may
     * become eof().
     * NOTE: For proper mutex yielding, dispose() must be called on any DocumentSource that will
     * not be advanced until eof(), see SERVER-6123.
     * 
     * @method	dispose
    **/
    proto.dispose = function dispose() {
        if ( this.pSource ) {
            // This is required for the DocumentSourceCursor to release its read lock, see
            // SERVER-6123.
            this.pSource.dispose();
        }
    };
    
    /**
     * Get the source's name.
     * 
     * @method	getSourceName
     * @returns	{String}	the string name of the source as a constant string; this is static, and there's no need to worry about adopting it
    **/
    proto.getSourceName = function getSourceName() {
		return "[UNKNOWN]";
    };
    
    /**
     * Set the underlying source this source should use to get Documents
     * from.
     * It is an error to set the source more than once.  This is to
     * prevent changing sources once the original source has been started;
     * this could break the state maintained by the DocumentSource.
     * This pointer is not reference counted because that has led to
     * some circular references.  As a result, this doesn't keep
     * sources alive, and is only intended to be used temporarily for
     * the lifetime of a Pipeline::run().
     * 
     * @method	setSource
     * @param	{DocumentSource}	pSource	the underlying source to use
    **/
    proto.setSource = function setSource(pTheSource, callback) {
		if(this.pSource){
			throw new Error("It is an error to set the source more than once");
		}
        this.pSource = pTheSource;
        if(callback)
            return callback(null, this.pSource);
    };
    
    
    /**
     * Attempt to coalesce this DocumentSource with its successor in the
     * document processing pipeline.  If successful, the successor
     * DocumentSource should be removed from the pipeline and discarded.
     * If successful, this operation can be applied repeatedly, in an
     * attempt to coalesce several sources together.
     * The default implementation is to do nothing, and return false.
     * 
     * @method	coalesce
     * @param	{DocumentSource}	pNextSource	the next source in the document processing chain.
     * @returns	{Boolean}	whether or not the attempt to coalesce was successful or not; if the attempt was not successful, nothing has been changed
    **/
    proto.coalesce = function coalesce(pNextSource) {
		return false;
    };
    
    /**
     * Optimize the pipeline operation, if possible.  This is a local
     * optimization that only looks within this DocumentSource.  For best
     * results, first coalesce compatible sources using coalesce().
     * This is intended for any operations that include expressions, and
     * provides a hook for those to optimize those operations.
     * The default implementation is to do nothing.
     * 
     * @method	optimize
    **/
    proto.optimize = function optimize(pNextSource) {
    };

	klass.GetDepsReturn = {
        NOT_SUPPORTED:"NOT_SUPPORTED", // This means the set should be ignored
        EXHAUSTIVE:"EXHAUSTIVE", // This means that everything needed should be in the set
        SEE_NEXT:"SEE_NEXT", // Add the next Source's deps to the set
	};

    /**
     * Get the fields this operation needs to do its job.
     * Deps should be in "a.b.c" notation
     * 
     * @method	getDependencies
     * @param	{Object} deps	set (unique array) of strings
     * @returns	DocumentSource.GetDepsReturn
    **/
    proto.getDependencies = function getDependencies(deps) {
		return klass.GetDepsReturn.NOT_SUPPORTED;
    };
    
  
    /**
     * This takes dependencies from getDependencies and
     * returns a projection that includes all of them
     * 
     * @method	depsToProjection
     * @param	{Object} deps	set (unique array) of strings
     * @returns	{Object}	JSONObj
    **/
    klass.depsToProjection = function depsToProjection(deps) {
        var bb = {};
        if (deps._id === undefined)
            bb._id = 0;

        var last = "";
        Object.keys(deps).forEach(function(it){
            if (last !== "" && it.slice(0, last.length) === last){
                // we are including a parent of *it so we don't need to
                // include this field explicitly. In fact, due to
                // SERVER-6527 if we included this field, the parent
                // wouldn't be fully included.
                return;
            }
            last = it + ".";
            bb[it] = 1;
        });
        
        return bb;
    };


    /**
     * Add the DocumentSource to the array builder.
     * The default implementation calls sourceToJson() in order to
     * convert the inner part of the object which will be added to the
     * array being built here.
     * 
     * @method	addToJsonArray
     * @param	{Array} pBuilder	JSONArrayBuilder: the array builder to add the operation to.
     * @param	{Boolean}	explain	create explain output
     * @returns	{Object}
    **/
    proto.addToJsonArray = function addToJsonArray(pBuilder, explain) {
		pBuilder.push(this.sourceToJson({}, explain));
    };

    /**
     * Create an object that represents the document source.  The object
     * will have a single field whose name is the source's name.  This
     * will be used by the default implementation of addToJsonArray()
     * to add this object to a pipeline being represented in JSON.
     * 
     * @method	sourceToJson
     * @param	{Object} pBuilder	JSONObjBuilder: a blank object builder to write to
     * @param	{Boolean}	explain	create explain output
    **/
    proto.sourceToJson = function sourceToJson(pBuilder, explain) {
		throw new Error("not implemented");
    };
    
    /**
     * Reset the document source so that it is ready for a new stream of data.
     * Note that this is a deviation from the mongo implementation.
     * 
     * @method	reset
    **/
    proto.reset = function reset(){
		throw new Error("not implemented");
    };

	return klass;
})();
