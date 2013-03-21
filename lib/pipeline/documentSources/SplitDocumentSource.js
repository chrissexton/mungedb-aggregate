var SplitDocumentSource = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * A document stream splitter
	 * 
	 * @class SortDocumentSource
	 * @namespace munge.pipeline.documentSources
	 * @module munge
	 * @constructor
	**/
	var klass = module.exports = SplitDocumentSource = function SplitDocumentSource(/* pCtx*/){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
		/*
		* Before returning anything, this source must fetch everything from
		* the underlying source and group it.  populate() is used to do that
		* on the first call to any method on this source.  The populated
		* boolean indicates that this has been done
		**/
		this.populated = false;
		this.current = null;
		this.docIterator = null; // a number tracking our position in the documents array
		this.documents = []; // an array of documents
		this.pipelines = {};

	}, base = require('./DocumentSource'), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});


	klass.splitName = "$split";
	proto.getSourceName = function getSourceName(){
		return klass.splitName;
	};
	
	proto.getFactory = function getFactory(){
		return klass;	// using the ctor rather than a separate .create() method
	};

	/**
	 * Is the source at EOF?
	 * 
	 * @method	eof
	 * @return {bool} return if we have hit the end of input
	**/
	proto.eof = function eof() {
		if (!this.populated)
			this.populate();
		return (this.docIterator == this.documents.length);
	};

	/**
	 * some implementations do the equivalent of verify(!eof()) so check eof() first
	 * 
	 * @method	getCurrent
	 * @returns	{Document}	the current Document without advancing
	**/
	proto.getCurrent = function getCurrent() {
		if (!this.populated)
			this.populate();
		return this.current;
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

		if (!this.populated)
			this.populate();

		if (this.docIterator == this.documents.length) throw new Error("This should never happen");
		++this.docIterator;

		if (this.docIterator == this.documents.length) {
			this.current = null;
			return false;
		}
		this.current = this.documents[this.docIterator];
		return true;
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
		builder.$split = {}; // TODO: this is the default for split but it may need to have a key? 
	};



	proto.populate = function populate() {
		/* pull everything from the underlying source */
		for(var hasNext = !this.pSource.eof(); hasNext; hasNext = this.pSource.advance()) {
			var doc = this.pSource.getCurrent();
			this.documents.push(doc);
		}
		
		var splitDocument = {};
		for(var pipelineKey in this.pipelines){
			var pipeline = this.pipelines[pipelineKey],
				result = {};
			result.ok = pipeline.run(this.documents, result);
			splitDocument[pipelineKey] = result.result;
		}

		//"Join" all documents by placing the various pipeline results as the only doc in this.documents
		this.documents = [splitDocument];

		this.docIterator = 0;
		if (this.docIterator < this.documents.length)
			this.current = this.documents[this.docIterator];
		this.populated = true;
	};





	/**
	 * Creates a new SortDocumentSource 
	 *
	 * @param {Object} JsonElement
	**/
	klass.createFromJson = function createFromJson(jsonElement) {
		if (typeof jsonElement !== "object") throw new Error("code 15973; the " + klass.sortName + " key specification must be an object");
		

		var split = new SplitDocumentSource(),
			splitKeys = 0,
			PipelineCommand = require('../../commands/PipelineCommand');
		for(var key in jsonElement) {
			split.pipelines[key] = new PipelineCommand(jsonElement[key]);
			++splitKeys;
		}

		if ( splitKeys <= 0) throw new Error("code 15977; " + klass.splitName + " must have at least one split key");
		return split;
	};
	
	/**
	 * Reset the document source so that it is ready for a new stream of data.
	 * Note that this is a deviation from the mongo implementation.
	 * 
	 * @method	reset
	**/
	proto.reset = function reset(){
		this.populated = false;
		this.current = null;
		this.docIterator = null; // a number tracking our position in the documents array
		this.documents = []; // an array of documents
	};

	return klass;
})();
