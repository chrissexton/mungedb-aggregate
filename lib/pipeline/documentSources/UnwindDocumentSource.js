var UnwindDocumentSource = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * A document source unwindper
	 * 
	 * @class UnwindDocumentSource
	 * @namespace munge.pipepline.documentsource
	 * @module munge
	 * @constructor
	 * @param {Object} query the match query to use
	**/
	var klass = module.exports = UnwindDocumentSource = function UnwindDocumentSource(/* pCtx*/){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
		
        // Configuration state.
        this._unwindPath = null;
        
        // Iteration state.
        this._unwinder = null;
		
	}, base = require('./DocumentSource'), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	var DocumentSource = base,
		FieldPath = require('../FieldPath'),
		Document = require('../Document'),
		Expression = require('../expressions/Expression');

	klass.Unwinder = (function(){
		/** 
		 * Helper class to unwind arrays within a series of documents. 
		 * 
		 * @param	{String}	unwindPath is the field path to the array to unwind.
		**/
		var klass = function Unwinder(unwindPath){

			// Path to the array to unwind.
			this._unwindPath = unwindPath;
			// The souce document to unwind.
			this._document = null;
			// Document indexes of the field path components.
			this._unwindPathFieldIndexes = [];
			// Iterator over the array within _document to unwind.
			this._unwindArrayIterator = null;
			// The last value returned from _unwindArrayIterator.
			//this._unwindArrayIteratorCurrent = undefined; //dont define this yet

		}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});
		
		/** 
		 * Reset the unwinder to unwind a new document. 
		 * 
		 * @param	{Object}	document
		**/
        proto.resetDocument = function resetDocument(document){
			if (!document){
				throw new Error("document is required!");
			}
			
			// Reset document specific attributes.
			this._document = document;
			this._unwindPathFieldIndexes.length = 0;
			this._unwindArrayIterator = null;
			delete this._unwindArrayIteratorCurrent;
	
			var pathValue = this.extractUnwindValue(); // sets _unwindPathFieldIndexes
			if (!pathValue || pathValue.length === 0) {
				// The path does not exist.
				return;
			}
			if (pathValue.constructor !== Array){
				throw new Error(UnwindDocumentSource.unwindName + ":  value at end of field path must be an array; code 15978");
			}
			
			// Start the iterator used to unwind the array.
			this._unwindArrayIterator = pathValue.slice(0);
			this._unwindArrayIteratorCurrent = this._unwindArrayIterator.splice(0,1)[0];
        };
        
        /** 
         * eof
         * 
         * @returns	{Boolean}	true if done unwinding the last document passed to resetDocument(). 
        **/
        proto.eof = function eof(){
			return !this.hasOwnProperty("_unwindArrayIteratorCurrent");
        };
        
        /**
         * Try to advance to the next document unwound from the document passed to resetDocument().
         * 
         * @returns	{Boolean} true if advanced to a new unwound document, but false if done advancing.
        **/
        proto.advance = function advance(){
			if (!this._unwindArrayIterator) {
				// resetDocument() has not been called or the supplied document had no results to
				// unwind.
				delete this._unwindArrayIteratorCurrent;
			} else if (!this._unwindArrayIterator.length) {
				// There are no more results to unwind.
				delete this._unwindArrayIteratorCurrent;
			} else {
				this._unwindArrayIteratorCurrent = this._unwindArrayIterator.splice(0, 1)[0];
			}
        };
        
        /**
         * Get the current document unwound from the document provided to resetDocument(), using
         * the current value in the array located at the provided unwindPath.  But return
         * intrusive_ptr<Document>() if resetDocument() has not been called or the results to unwind
         * have been exhausted.
         * 
         * @returns	{Object}
        **/
        proto.getCurrent = function getCurrent(){
			if (!this.hasOwnProperty("_unwindArrayIteratorCurrent")) {
				return null;
			}
			
			// Clone all the documents along the field path so that the end values are not shared across
			// documents that have come out of this pipeline operator.  This is a partial deep clone.
			// Because the value at the end will be replaced, everything along the path leading to that
			// will be replaced in order not to share that change with any other clones (or the
			// original).
			
			var clone = Document.clone(this._document);
			var current = clone;
			var n = this._unwindPathFieldIndexes.length;
			if (!n) {
				throw new Error("unwindFieldPathIndexes are empty");
			}
			for (var i = 0; i < n; ++i) {
				var fi = this._unwindPathFieldIndexes[i];
				var fp = current[fi];
				if (i + 1 < n) {
					// For every object in the path but the last, clone it and continue on down.
					var next = Document.clone(fp);
					current[fi] = next;
					current = next;
				} else {
					// In the last nested document, subsitute the current unwound value.
					current[fi] = this._unwindArrayIteratorCurrent;
				}
			}
			
			return clone;
        };
        
        /**
         * Get the value at the unwind path, otherwise an empty pointer if no such value
         * exists.  The _unwindPathFieldIndexes attribute will be set as the field path is traversed
         * to find the value to unwind.
         * 
         * @returns	{Object}
        **/
        proto.extractUnwindValue = function extractUnwindValue(){
			var current = this._document;
			var pathValue;
			var pathLength = this._unwindPath.getPathLength();
			for (var i = 0; i < pathLength; ++i) {
			
				var idx = this._unwindPath.getFieldName(i);
			
				if (!current.hasOwnProperty(idx)) {
					// The target field is missing.
					return null;
				}
			
				// Record the indexes of the fields down the field path in order to quickly replace them
				// as the documents along the field path are cloned.
				this._unwindPathFieldIndexes.push(idx);
			
				pathValue = current[idx];
			
				if (i < pathLength - 1) {
			
					if (typeof pathValue !== 'object') {
						// The next field in the path cannot exist (inside a non object).
						return null;
					}
			
					// Move down the object tree.
					current = pathValue;
				}
			}
			
			return pathValue;
        };
		
		return klass;
	})();
	
	/**
	 * Lazily construct the _unwinder and initialize the iterator state of this DocumentSource.
	 * To be called by all members that depend on the iterator state.
	**/
	proto.lazyInit = function lazyInit(){
        if (!this._unwinder) {
            if (!this._unwindPath){
				throw new Error("unwind path does not exist!");
            }
            this._unwinder = new klass.Unwinder(this._unwindPath);
            if (!this.pSource.eof()) {
                // Set up the first source document for unwinding.
                this._unwinder.resetDocument(this.pSource.getCurrent());
            }
            this.mayAdvanceSource();
        }
	};
	
	/**
	 * If the _unwinder is exhausted and the source may be advanced, advance the pSource and
	 * reset the _unwinder's source document.
	**/
	proto.mayAdvanceSource = function mayAdvanceSource(){
        while(this._unwinder.eof()) {
            // The _unwinder is exhausted.

            if (this.pSource.eof()) {
                // The source is exhausted.
                return;
            }
            if (!this.pSource.advance()) {
                // The source is exhausted.
                return;
            }
            // Reset the _unwinder with pSource's next document.
            this._unwinder.resetDocument(this.pSource.getCurrent());
        }
	};
	
	/** 
	 * Specify the field to unwind. 
	**/
	proto.unwindPath = function unwindPath(fieldPath){
        // Can't set more than one unwind path.
        if (this._unwindPath){
			throw new Error(this.getSourceName() + " can't unwind more than one path; code 15979");
        }
                
        // Record the unwind path.
        this._unwindPath = new FieldPath(fieldPath);
	};

	klass.unwindName = "$unwind";
	proto.getSourceName = function getSourceName(){
		return klass.unwindName;
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
        if (!this._unwindPath){
			throw new Error("unwind path does not exist!");
        }
        deps[this._unwindPath.getPath(false)] = 1;
        return DocumentSource.GetDepsReturn.SEE_NEXT;
    };


    /**
     * Is the source at EOF?
     * 
     * @method	eof
    **/
    proto.eof = function eof() {
        this.lazyInit();
        return this._unwinder.eof();
    };

    /**
     * some implementations do the equivalent of verify(!eof()) so check eof() first
     * 
     * @method	getCurrent
     * @returns	{Document}	the current Document without advancing
    **/
    proto.getCurrent = function getCurrent() {
        this.lazyInit();
        return this._unwinder.getCurrent();
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
        this.lazyInit();
        this._unwinder.advance();
        this.mayAdvanceSource();
        return !this._unwinder.eof();
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
        if (!this._unwindPath){
			throw new Error("unwind path does not exist!");
        }
        builder[this.getSourceName()] = this._unwindPath.getPath(true);
	};

	/**
	 * Creates a new UnwindDocumentSource with the input path as the path to unwind
	 *
	 * @param {String} JsonElement this thing is *called* Json, but it expects a string
	**/
	klass.createFromJson = function createFromJson(JsonElement) {
        /*
          The value of $unwind should just be a field path.
         */
        if (JsonElement.constructor !== String){
			throw new Error("the " + klass.unwindName + " field path must be specified as a string; code 15981");
        }

        var pathString = Expression.removeFieldPrefix(JsonElement);
        var unwind = new UnwindDocumentSource();
        unwind.unwindPath(pathString);

        return unwind;
	};
	
    /**
     * Reset the document source so that it is ready for a new stream of data.
     * Note that this is a deviation from the mongo implementation.
     * 
     * @method	reset
    **/
	proto.reset = function reset(){
        this._unwinder = null;
	};

	return klass;
})();
