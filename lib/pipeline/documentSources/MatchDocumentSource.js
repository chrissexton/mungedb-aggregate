"use strict";
var MatchDocumentSource = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * A match document source built off of FilterBaseDocumentSource
	 *
	 * NOTE: THIS IS A DEVIATION FROM THE MONGO IMPLEMENTATION.
	 * TODO: internally uses `sift` to fake it, which has bugs, so we need to reimplement this by porting the MongoDB implementation
	 *
	 * @class MatchDocumentSource
	 * @namespace mungedb-aggregate.pipeline.documentSources
	 * @module mungedb-aggregate
	 * @constructor
	 * @param {Object} query the match query to use
	 * @param [ctx] {ExpressionContext}
	 **/
	var klass = module.exports = MatchDocumentSource = function MatchDocumentSource(query, ctx){
		if(arguments.length > 2) throw new Error("up to two args expected");
		if(!query) throw new Error("arg `query` is required");
		base.call(this, ctx);
		this.query = query; // save the query, so we can check it for deps later. THIS IS A DEVIATION FROM THE MONGO IMPLEMENTATION
		this.matcher = sift(query);
	}, base = require('./FilterBaseDocumentSource'), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var sift = require("sift");	//TODO: DEVIATION FROM MONGO: this was a temporary hack to get this done quickly but it is too inconsistent to keep; need a real port of MatchDocumentSource

	klass.matchName = "$match";
	proto.getSourceName = function getSourceName(){
		return klass.matchName;
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
		builder[this.getSourceName()] = this.matcher.query;
	};

	/**
	* Test the given document against the predicate and report if it should be accepted or not.
	*
	* @param {object} document the document to test
	* @returns {bool} true if the document matches the filter, false otherwise
	**/
	proto.accept = function accept(document) {
		/**
		* The matcher only takes BSON documents, so we have to make one.
		*
		* LATER
		* We could optimize this by making a document with only the
		* fields referenced by the Matcher.  We could do this by looking inside
		* the Matcher's BSON before it is created, and recording those.  The
		* easiest implementation might be to hold onto an ExpressionDocument
		* in here, and give that pDocument to create the created subset of
		* fields, and then convert that instead.
		**/
		return this.matcher.test(document);
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
	* @param builder the builder to write to
	**/
	proto.toMatcherJson = function toMatcherJson(builder) {
		var q = this.matcher.query;
		for(var k in q){
			builder[k] = q[k];
		}
	};

	klass.uassertNoDisallowedClauses = function uassertNoDisallowedClauses(query) {
		for(var key in query){
			if(query.hasOwnProperty(key)){
				// can't use the Matcher API because this would segfault the constructor
				if ( query[key] == "$where") throw new Error("code 16395; $where is not allowed inside of a $match aggregation expression");
				// geo breaks if it is not the first portion of the pipeline
				if ( query[key] == "$near") throw new Error("code 16424; $near is not allowed inside of a $match aggregation expression");
				if ( query[key] == "$within") throw new Error("code 16425l $within is not allowed inside of a $match aggregation expression");
				if ( query[key] == "$nearSphere") throw new Error("code 16426; $nearSphere is not allowed inside of a $match aggregation expression");
				if(query[key] instanceof Object && query[key].constructor === Object) this.uassertNoDisallowedClauses(query[key]);
			}
		}
	};

	klass.createFromJson = function createFromJson(jsonElement, ctx) {
		if (!(jsonElement instanceof Object) || jsonElement.constructor !== Object) throw new Error("code 15959 ; the match filter must be an expression in an object");
		klass.uassertNoDisallowedClauses(jsonElement);
		var matcher = new MatchDocumentSource(jsonElement, ctx);
		return matcher;
	};

	return klass;
})();
