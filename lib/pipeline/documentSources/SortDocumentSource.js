var SortDocumentSource = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * A document source sorter
	 *
	 * Since we don't have shards, this inherits from DocumentSource, instead of SplittableDocumentSource
	 * 
	 * @class SortDocumentSource
	 * @namespace munge.pipepline.documentsource
	 * @module munge
	 * @constructor
	**/
	var klass = module.exports = SortDocumentSource = function SortDocumentSource(/* pCtx*/){
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

		this.vSortKey = [];
		this.vAscending = [];
	}, base = require('./DocumentSource'), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var FieldPathExpression = require("../expressions/FieldPathExpression"),
		Value = require("../Value");

	klass.sortName = "$sort";
	proto.getSourceName = function getSourceName(){
		return klass.sortName;
	};
	
	proto.getFactory = function getFactory(){
		return klass;	// using the ctor rather than a separate .create() method
	};

	klass.GetDepsReturn = {
		SEE_NEXT:"SEE_NEXT", // Add the next Source's deps to the set
	};

	proto.getDependencies = function getDependencies() {
		for(var i = 0; i < this.vSortKey.length; ++i) {
			this.vSortKey[i].addDependencies(deps);
		}
		return this.GetDepsReturn.SEE_NEXT;
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
		var insides = {};
		this.sortKeyToJson(insides, false);
		builder[this.getSourceName()] = insides;
	};

	/**
	* Add sort key field.
	*
	* Adds a sort key field to the key being built up.  A concatenated
	* key is built up by calling this repeatedly.
	*
	* @param {String} fieldPath the field path to the key component
	* @param {bool} ascending if true, use the key for an ascending sort, otherwise, use it for descending
	**/
	proto.addKey = function addKey(fieldPath, ascending) {
		var pathExpr = new FieldPathExpression(fieldPath);
		this.vSortKey.push(pathExpr);
		if (ascending == -1)
			this.vAscending.push(0);
		else if (typeof ascending !== "undefined" && typeof ascending !== null)
			this.vAscending.push(ascending);
		else
			this.vAscending.push(0);

	};

	proto.populate = function populate() {
		/* make sure we've got a sort key */
		if (this.vSortKey.length === null) throw new Error("This should never happen");
			
		/* pull everything from the underlying source */
		for(var hasNext = !this.pSource.eof(); hasNext; hasNext = this.pSource.advance()) {
			var doc = this.pSource.getCurrent();
			this.documents.push(doc);
		}

		/* sort the list */
		this.documents.sort(SortDocumentSource.prototype.compare.bind(this));

		/* start the sort iterator */
		this.docIterator = 0;

		if (this.docIterator < this.documents.length)
			this.current = this.documents[this.docIterator];
		this.populated = true;
	};

	/**
	 * Compare two documents according to the specified sort key.
	 *
	 * @param {Object} pL the left side doc
	 * @param {Object} pR the right side doc
	 * @returns {Number} a number less than, equal to, or greater than zero, indicating pL < pR, pL == pR, or pL > pR, respectively
	**/
	proto.compare = function compare(pL,pR) {
		/**
		* populate() already checked that there is a non-empty sort key,
		* so we shouldn't have to worry about that here.
		*
		* However, the tricky part is what to do is none of the sort keys are
		* present.  In this case, consider the document less.
		**/
		var n = this.vSortKey.length;
		for(var i = 0; i < n; ++i) {
			/* evaluate the sort keys */
			var pathExpr = new FieldPathExpression(this.vSortKey[i].getFieldPath(false));
			var left = pathExpr.evaluate(pL), right = pathExpr.evaluate(pR);

			/*
			Compare the two values; if they differ, return.  If they are
			the same, move on to the next key.
			*/
			var cmp = Value.compare(left, right);
			if (cmp) {
				/* if necessary, adjust the return value by the key ordering */
				if (!this.vAscending[i])
					cmp = -cmp;
				return cmp;
			}
		}
		/**
		* If we got here, everything matched (or didn't exist), so we'll
		* consider the documents equal for purposes of this sort
		**/
		return 0;
	};

	/**
	* Write out an object whose contents are the sort key.
	*
	* @param {Object} builder initialized object builder.
	* @param {bool} fieldPrefix specify whether or not to include the field 
	**/
	proto.sortKeyToJson = function sortKeyToJson(builder, usePrefix) {
		/* add the key fields */
		var n = this.vSortKey.length;
		for(var i = 0; i < n; ++i) {
			/* create the "field name" */
			var ss = this.vSortKey[i].getFieldPath(usePrefix); // renamed write to get
			/* push a named integer based on the sort order */
			builder[ss] = (this.vAscending[i] ? 1 : 0);
		}
	};

	/**
	 * Creates a new SortDocumentSource 
	 *
	 * @param {Object} JsonElement
	**/
	klass.createFromJson = function createFromJson(JsonElement) {
		if (typeof JsonElement !== "object") throw new Error("code 15973; the " + klass.sortName + " key specification must be an object");

		var Sort = proto.getFactory(),
			nextSort = new Sort();

		/* check for then iterate over the sort object */
		var sortKeys = 0;
		for(var key in JsonElement) {
			var sortOrder = 0;

			if (typeof JsonElement[key] !== "number") throw new Error("code 15974; " + klass.sortName + " key ordering must be specified using a number");

			sortOrder = JsonElement[key];
			if ((sortOrder != 1) && (sortOrder !== 0)) throw new Error("code 15975; " + klass.sortName + " key ordering must be 1 (for ascending) or -1 (for descending)");

			nextSort.addKey(key, (sortOrder > 0));
			++sortKeys;
		}

		if (sortKeys <= 0) throw new Error("code 15976; " + klass.sortName + " must have at least one sort key");
		return nextSort;
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
