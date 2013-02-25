var FilterBaseDocumentSource = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * A base class for filter document sources
	 * 
	 * @class FilterBaseDocumentSource
	 * @namespace munge.pipeline.documentsource
	 * @module munge
	 * @constructor
	 * @param	{ExpressionContext}	
	**/
	var klass = module.exports = FilterBaseDocumentSource = function FilterBaseDocumentSource(/*pCtx*/){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
		this.unstarted = true;
		this.hasNext = false;
		this.pCurrent = null;
	}, base = require('./DocumentSource'), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	/**
	 * Find the next acceptable source document, if there are any left.
	 *
	 * @method findNext
	**/
	proto.findNext = function findNext() {
		/* only do this the first time */
		if (this.unstarted) {
			this.hasNext = !this.pSource.eof();
			this.unstarted = false;
		}

		while(this.hasNext) {
			var pDocument = this.pSource.getCurrent();
			this.hasNext = this.pSource.advance();

			if (this.accept(pDocument)) {
				this.pCurrent = pDocument;
				return;
			}
		}

		this.pCurrent = null;
	};

	/**
	 * Is the source at EOF?
	 * 
	 * @method	eof
	**/
	proto.eof = function eof() {
		if (this.unstarted)
			this.findNext();
		return (this.pCurrent === null);
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

		if (this.unstarted)
			this.findNext();

		/**
		* This looks weird after the above, but is correct.  Note that calling
		* getCurrent() when first starting already yields the first document
		* in the collection.  Calling advance() without using getCurrent()
		* first will skip over the first item.
		**/
		this.findNext();
		return (this.pCurrent !== null);
	};
	
	/**
	 * some implementations do the equivalent of verify(!eof()) so check eof() first
	 * 
	 * @method	getCurrent
	 * @returns	{Document}	the current Document without advancing
	**/
	proto.getCurrent = function getCurrent() {
		if (this.unstarted)
			this.findNext();
		if (this.pCurrent === null) throw new Error("This should never happen");
		return this.pCurrent;
	};

	/**
	* Test the given document against the predicate and report if it
	* should be accepted or not.
	*
	* @param {object} pDocument the document to test
	* @returns {bool} true if the document matches the filter, false otherwise
	**/
	proto.accept = function accept(pDocument) {
		throw new Error("not implemented");
	};

	/**
	* Create a JSONObj suitable for Matcher construction.
	*
	* This is used after filter analysis has moved as many filters to
	* as early a point as possible in the document processing pipeline.
	* See db/Matcher.h and the associated wiki documentation for the
	* format.  This conversion is used to move back to the low-level
	* find() Cursor mechanism.
	*
	* @param pBuilder the builder to write to
	**/
	proto.toMatcherJson = function toMatcherJson(pBuilder) {
		throw new Error("not implemented");
	};
    /**
     * Reset the document source so that it is ready for a new stream of data.
     * Note that this is a deviation from the mongo implementation.
     * 
     * @method	reset
    **/
	proto.reset = function reset(){
		this.unstarted = true;
	};

	return klass;
})();
