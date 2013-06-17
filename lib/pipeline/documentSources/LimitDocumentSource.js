"use strict";
var LimitDocumentSource = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * A document source limiter
	 * @class LimitDocumentSource
	 * @namespace mungedb-aggregate.pipeline.documentSources
	 * @module mungedb-aggregate
	 * @constructor
	 * @param [ctx] {ExpressionContext}
	**/
	var klass = module.exports = LimitDocumentSource = function LimitDocumentSource(ctx){
		if(arguments.length > 1) throw new Error("up to one arg expected");
		base.call(this, ctx);
		this.limit = 0;
		this.count = 0;
	}, base = require('./DocumentSource'), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	klass.limitName = "$limit";
	proto.getSourceName = function getSourceName(){
		return klass.limitName;
	};

	proto.getFactory = function getFactory(){
		return klass;	// using the ctor rather than a separate .create() method
	};

	/**
	 * Coalesce limits together
	 *
	 * @param {Object} nextSource the next source
	 * @return {bool} return whether we can coalese together
	**/
	proto.coalesce = function coalesce(nextSource) {
		var nextLimit =	nextSource.constructor === LimitDocumentSource?nextSource:null;

		/* if it's not another $limit, we can't coalesce */
		if (!nextLimit)
			return false;
		/* we need to limit by the minimum of the two limits */
		if (nextLimit.limit < this.limit)
			this.limit = nextLimit.limit;
		return true;
	};

	/**
	 * Is the source at EOF?
	 *
	 * @method	eof
	**/
	proto.eof = function eof() {
		return this.source.eof() || this.count >= this.limit;
	};

	/**
	 * some implementations do the equivalent of verify(!eof()) so check eof() first
	 *
	 * @method	getCurrent
	 * @returns	{Document}	the current Document without advancing
	**/
	proto.getCurrent = function getCurrent() {
		return this.source.getCurrent();
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
		++this.count;
		if (this.count >= this.limit) {
			return false;
		}
		this.pCurrent = this.source.getCurrent();
		return this.source.advance();
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
		builder.$limit = this.limit;
	};

	/**
	 * Creates a new LimitDocumentSource with the input number as the limit
	 *
	 * @param {Number} JsonElement this thing is *called* Json, but it expects a number
	**/
	klass.createFromJson = function createFromJson(jsonElement, ctx) {
		if (typeof jsonElement !== "number") throw new Error("code 15957; the limit must be specified as a number");

		var Limit = proto.getFactory(),
			nextLimit = new Limit(ctx);

		nextLimit.limit = jsonElement;
		if ((nextLimit.limit <= 0) || isNaN(nextLimit.limit)) throw new Error("code 15958; the limit must be positive");

		return nextLimit;
	};

	return klass;
})();
