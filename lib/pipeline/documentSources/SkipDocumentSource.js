var SkipDocumentSource = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * A document source skipper
	 * 
	 * @class SkipDocumentSource
	 * @namespace munge.pipepline.documentsource
	 * @module munge
	 * @constructor
	 * @param {Object} query the match query to use
	**/
	var klass = module.exports = SkipDocumentSource = function SkipDocumentSource(/* pCtx*/){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
		this.skip = 0;
		this.count = 0;
	}, base = require('./DocumentSource'), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	klass.skipName = "$skip";
	proto.getSourceName = function getSourceName(){
		return klass.skipName;
	};

	/**
	 * Coalesce skips together
	 *
	 * @param {Object} nextSource the next source
	 * @return {bool} return whether we can coalese together
	**/
	proto.coalesce = function coalesce(nextSource) {
		var nextSkip =	nextSource.constructor === SkipDocumentSource?nextSource:null;

		/* if it's not another $skip, we can't coalesce */
		if (!nextSkip)
			return false;
			
        /* we need to skip over the sum of the two consecutive $skips */
		this.skip += nextSkip.skip;
		return true;
	};

	proto.skipper = function skipper() {
		if (this.count === 0) {
			while (!this.pSource.eof() && this.count++ < this.skip) {
				this.pSource.advance();
			}
		}
	
		if (this.pSource.eof()) {
			this.pCurrent = null;
			return;
		}
	
		this.pCurrent = this.pSource.getCurrent();
	};


    /**
     * Is the source at EOF?
     * 
     * @method	eof
    **/
    proto.eof = function eof() {
		this.skipper();
		return this.pSource.eof();
    };

    /**
     * some implementations do the equivalent of verify(!eof()) so check eof() first
     * 
     * @method	getCurrent
     * @returns	{Document}	the current Document without advancing
    **/
    proto.getCurrent = function getCurrent() {
		this.skipper();
		return this.pSource.getCurrent();
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
		base.prototype.advance.call(this); // check for interrupts
        if (this.eof()) {
            this.pCurrent = null;
            return false;
        }

        this.pCurrent = this.pSource.getCurrent();
        return this.pSource.advance();

	};

	/**
	 * Create an object that represents the document source.  The object
	 * will have a single field whose name is the source's name.  This
	 * will be used by the default implementation of addToJsonArray()
	 * to add this object to a pipeline being represented in JSON.
	 * 
	 * @method	sourceToJson
	 * @param	{Object} builder	JSONObjBuilder: a blank object builder to write to
	 * @param	{Boolean}	explain	create explain output
	**/
	proto.sourceToJson = function sourceToJson(builder, explain) {
		builder.$skip = this.skip;
	};

	/**
	 * Creates a new SkipDocumentSource with the input number as the skip
	 *
	 * @param {Number} JsonElement this thing is *called* Json, but it expects a number
	**/
	klass.createFromJson = function createFromJson(JsonElement) {
		if (typeof JsonElement !== "number") throw new Error("code 15972; the value to skip must be a number");

		var nextSkip = new SkipDocumentSource();

		nextSkip.skip = JsonElement;
		if ((nextSkip.skip < 0) || isNaN(nextSkip.skip)) throw new Error("code 15956; the number to skip cannot be negative");

		return nextSkip;
	};
	
    /**
     * Reset the document source so that it is ready for a new stream of data.
     * Note that this is a deviation from the mongo implementation.
     * 
     * @method	reset
    **/
	proto.reset = function reset(){
		this.count = 0;
	};

	return klass;
})();
