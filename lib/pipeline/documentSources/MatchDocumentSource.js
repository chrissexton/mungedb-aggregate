"use strict";
var MatchDocumentSource = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * A match document source built off of FilterBaseDocumentSource
	 * Currently uses sift to fake it
	 * 
	 * @class MatchDocumentSource
	 * @namespace munge.pipeline.documentsource
	 * @module munge
	 * @constructor
	 * @param {Object} query the match query to use
	**/
	var klass = module.exports = MatchDocumentSource = function MatchDocumentSource(query /*, pCtx*/){
		if(arguments.length !== 1) throw new Error("one arg expected");
		base.call(this);
		this.query = query; // save the query, so we can check it for deps later. THIS IS A DEVIATION FROM THE MONGO IMPLEMENTATION
		this.matcher = sift(query);
	}, base = require('./FilterBaseDocumentSource'), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	klass.extend = function extend(obj, withObj){
		var args = Array.prototype.slice.call(arguments), lastArg = args[args.length - 1]; 
		for(var i = 1, n = args.length; i < n; i++){
			withObj = args[i];
			for(var key in withObj){
				if(withObj.hasOwnProperty(key)){
					var objVal = obj[key], withObjVal = withObj[key];
					if(objVal instanceof Object && withObjVal.constructor === Object){
						klass.extend(objVal, withObjVal);
					}else{
						obj[key] = withObjVal;
					}
				}
			}
		}   
		return obj;
	};

	// DEPENDENCIES
	var sift = require("sift"),
		traverse = require("traverse");

	klass.matchName = "$match";
	proto.getSourceName = function getSourceName(){
		return klass.matchName;
	};


	/**
	*	Adds dependencies to the contained ObjectExpression
	*
	*	THIS IS A DEVIATION FROM THE MONGO IMPLEMENTATION.
	*
	*	@param {deps} An object that is treated as a set of strings
	*	@return A string that is part of the GetDepsReturn enum
	**/
	proto.getDependencies = function getDependencies(deps) {
		var tmpArr = [];
		// We need to construct a facets for both keys and values if they contain dotted paths
		traverse(this.query).forEach(function(value) {
			var key = this.key;
			if (typeof value == "string" && value[0] == "$") { // If we find a document path in the value
				tmpArr.push(value.replace(/^\$/, ""));
			} else if (key && /^[A-Za-z_]/.test(key)) { //if we find a non-operator as a key
				tmpArr.push(key);
			}
		});
		for (var i = 0; i < tmpArr.length; i++) {
			deps[tmpArr[i]] = 1;
		}
        return "SEE_NEXT";
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
	* Test the given document against the predicate and report if it
	* should be accepted or not.
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
		klass.extend(builder, this.matcher.query);
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

				if(query[key] instanceof Object && query[key].constructor === Object)
					this.uassertNoDisallowedClauses(query[key]);
			}
		}
	}; 

	klass.createFromJson = function createFromJson(JsonElement) {
		if (!(JsonElement instanceof Object) || JsonElement.constructor !== Object) throw new Error("code 15959 ; the match filter must be an expression in an object");

		klass.uassertNoDisallowedClauses(JsonElement);

		var matcher = new MatchDocumentSource(JsonElement);

		return matcher;
	};

	return klass;
})();
