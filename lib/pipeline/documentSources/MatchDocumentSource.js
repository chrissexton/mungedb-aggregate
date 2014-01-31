"use strict";
var async = require("async"),
	matcher = require("../matcher/Matcher2.js"),
	DocumentSource = require("./DocumentSource");

/**
 * A match document source built off of DocumentSource
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
var MatchDocumentSource = module.exports = function MatchDocumentSource(query, ctx){
	if (arguments.length > 2) throw new Error("up to two args expected");
	if (!query) throw new Error("arg `query` is required");
	base.call(this, ctx);
	this.query = query; // save the query, so we can check it for deps later. THIS IS A DEVIATION FROM THE MONGO IMPLEMENTATION
	this.matcher = new matcher(query);
}, klass = MatchDocumentSource, base = require('./DocumentSource'), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

klass.matchName = "$match";

proto.getSourceName = function getSourceName(){
	return klass.matchName;
};

proto.getNext = function getNext(callback) {
	var self = this,
		next;
	async.doWhilst(
		function(cb) {
			self.source.getNext(function(err, val) {
				next = val;

				if (self.matcher.matches(next))
					return cb(next);
				return cb();
			});
		},
		function() {
			return next !== DocumentSource.EOF;
		},
		function(doc) {
			if (!doc)
				return callback(null, DocumentSource.EOF);
			return callback(null, doc);
		}

	);
};

proto.coalesce = function coalesce(nextSource) {
	if (!(nextSource instanceof MatchDocumentSource))
		return false;

	this.matcher = new matcher({"$and": [this.getQuery(), nextSource.getQuery()]});

	return true;
};

proto.serialize = function(explain) {
	var out = {};
	out[this.getSourceName()] = this.getQuery();
	return out;
};

klass.uassertNoDisallowedClauses = function uassertNoDisallowedClauses(query) {
	for(var key in query){
		if(query.hasOwnProperty(key)){
			// can't use the Matcher API because this would segfault the constructor
			if (query[key] == "$where") throw new Error("code 16395; $where is not allowed inside of a $match aggregation expression");
			// geo breaks if it is not the first portion of the pipeline
			if (query[key] == "$near") throw new Error("code 16424; $near is not allowed inside of a $match aggregation expression");
			if (query[key] == "$within") throw new Error("code 16425; $within is not allowed inside of a $match aggregation expression");
			if (query[key] == "$nearSphere") throw new Error("code 16426; $nearSphere is not allowed inside of a $match aggregation expression");
			if (query[key] instanceof Object && query[key].constructor === Object) this.uassertNoDisallowedClauses(query[key]);
		}
	}
};

klass.createFromJson = function createFromJson(jsonElement, ctx) {
	if (!(jsonElement instanceof Object) || jsonElement.constructor !== Object) throw new Error("code 15959 ; the match filter must be an expression in an object");
	klass.uassertNoDisallowedClauses(jsonElement);
	var matcher = new MatchDocumentSource(jsonElement, ctx);
	return matcher;
};

proto.getQuery = function getQuery() {
	return this.matcher._pattern;
};

/** Returns the portion of the match that can safely be promoted to before a $redact.
 *  If this returns an empty BSONObj, no part of this match may safely be promoted.
 *
 *  To be safe to promote, removing a field from a document to be matched must not cause
 *  that document to be accepted when it would otherwise be rejected. As an example,
 *  {name: {$ne: "bob smith"}} accepts documents without a name field, which means that
 *  running this filter before a redact that would remove the name field would leak
 *  information. On the other hand, {age: {$gt:5}} is ok because it doesn't accept documents
 *  that have had their age field removed.
 */
proto.redactSafePortion = function redactSafePortion() {
	throw new Error("not implemented");
};
