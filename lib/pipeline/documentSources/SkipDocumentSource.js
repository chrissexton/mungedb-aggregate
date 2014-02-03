"use strict";

var async = require('async'),
	DocumentSource = require('./DocumentSource');

/**
 * A document source skipper
 * @class SkipDocumentSource
 * @namespace mungedb-aggregate.pipeline.documentSources
 * @module mungedb-aggregate
 * @constructor
 * @param [ctx] {ExpressionContext}
 **/
var SkipDocumentSource = module.exports = function SkipDocumentSource(ctx){
	if (arguments.length > 1) throw new Error("up to one arg expected");
	base.call(this, ctx);
	this.skip = 0;
	this.count = 0;
}, klass = SkipDocumentSource, base = require('./DocumentSource'), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

klass.skipName = "$skip";
proto.getSourceName = function getSourceName(){
	return klass.skipName;
};

/**
 * Coalesce skips together
 * @param {Object} nextSource the next source
 * @return {bool} return whether we can coalese together
 **/
proto.coalesce = function coalesce(nextSource) {
	var nextSkip =	nextSource.constructor === SkipDocumentSource?nextSource:null;

	// if it's not another $skip, we can't coalesce
	if (!nextSkip) return false;

	// we need to skip over the sum of the two consecutive $skips
	this.skip += nextSkip.skip;
	return true;
};

proto.getNext = function getNext(callback) {
	if (!callback) return new Error(this.getSourceName() + ' #getNext() requires callback');

	var self = this;

	if (this.count < this.skip) {

		async.doWhilst(
			function(cb) {
				self.source.getNext(function(err, val) {
					self.count++;
					if (val === DocumentSource.EOF)
						return cb(val);
					return cb();
				});
			},
			function() {
				return self.count < self.skip;
			},
			function(err) {
				if (err)
					return callback(err);
			}
		);
	}

	return this.source.getNext(callback);
};

proto.serialize = function(explain) {
	var out = {};
	out[this.getSourceName()] = this.skip;
	return out;
};

/**
 * Creates a new SkipDocumentSource with the input number as the skip
 *
 * @param {Number} JsonElement this thing is *called* Json, but it expects a number
 **/
klass.createFromJson = function createFromJson(jsonElement, ctx) {
	if (typeof jsonElement !== "number") throw new Error("code 15972; the value to skip must be a number");

	var nextSkip = new SkipDocumentSource(ctx);

	nextSkip.skip = jsonElement;
	if (nextSkip.skip < 0 || isNaN(nextSkip.skip)) throw new Error("code 15956; the number to skip cannot be negative");

	return nextSkip;
};
