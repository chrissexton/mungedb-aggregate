"use strict";

var async = require("async"),
	DocumentSource = require("./DocumentSource"),
	Expression = require("../expressions/Expression"),
	Variables = require("../expressions/Variables"),
	VariablesIdGenerator = require("../expressions/VariablesIdGenerator"),
	VariablesParseState = require("../expressions/VariablesParseState");

/**
 * A document source skipper
 * @class RedactDocumentSource
 * @namespace mungedb-aggregate.pipeline.documentSources
 * @module mungedb-aggregate
 * @constructor
 * @param [ctx] {ExpressionContext}
 **/
var RedactDocumentSource = module.exports = function RedactDocumentSource(ctx, expression){
	if (arguments.length > 2) throw new Error("up to two args expected");
	base.call(this, ctx);
	this._expression = expression;
	this._variables = new Variables();
	this._currentId = null;
}, klass = RedactDocumentSource, base = require('./DocumentSource'), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

klass.redactName = "$redact";
proto.getSourceName = function getSourceName(){
	return klass.redactName;
};

var DESCEND_VAL = 'descend',
	PRUNE_VAL = 'prune',
	KEEP_VAL = 'keep';

proto.getNext = function getNext(callback) {
	var self = this,
		doc;
	async.whilst(
		function() {
			return doc !== DocumentSource.EOF;
		},
		function(cb) {
			self.source.getNext(function(err, input) {
				doc = input;
				if (input === DocumentSource.EOF)
					return cb();
				self._variables.setRoot(input);
				self._variables.setValue(self._currentId, input);
				var result = self.redactObject();
				if (result !== DocumentSource.EOF)
					return cb(result); //Using the err argument to pass the result document; this lets us break out without having EOF
				return cb();
			});
		},
		function(doc) {
			if (doc)
				return callback(null, doc);
			return callback(null, DocumentSource.EOF);
		}
	);
	return doc;
};

proto.redactValue = function redactValue(input) {
	// reorder to make JS happy with types
	if (input instanceof Array) {
		var newArr,
			arr = input;
		for (var i = 0; i < arr.length; i++) {
			if ((arr[i] instanceof Object && arr[i].constructor === Object) || arr[i] instanceof Array) {
				var toAdd = this.redactValue(arr[i]);
				if (toAdd)
					newArr.push(arr[i]);
			} else {
				newArr.push(arr[i]);
			}
		}
		return newArr;
	} else if (input instanceof Object && input.constructor === Object) {
		this._variables.setValue(this._currentId, input);
		var result = this.redactObject();
		if (result !== DocumentSource.EOF)
			return result;
		return null;
	} else {
		return input;
	}
};

/**
 * Redacts the current object
 **/
proto.redactObject = function redactObject() {
	var expressionResult = this._expression.evaluate(this._variables);

	if (expressionResult === KEEP_VAL) {
		return this._variables.getDocument(this._currentId);
	} else if (expressionResult === PRUNE_VAL) {
		return DocumentSource.EOF;
	} else if (expressionResult === DESCEND_VAL) {
		var input = this._variables.getDocument(this._currentId);
		var out;

		var inputKeys = Object.keys(input);
		for (var i = 0; i < inputKeys.length; i++) {
			var field = inputKeys[i],
				value = input[field];

			var val = this.redactValue(value);
			if (val)
				out[field] = val;
		}

		return out;
	} else {
		throw new Error("17053 $redact's expression should not return anything aside from the variables $$KEEP, $$DESCEND, and $$PRUNE, but returned " + expressionResult);
	}
};

proto.optimize = function optimize() {
	this._expression = this._expression.optimize();
};

proto.serialize = function serialize(explain) {
	var doc = {};
	doc[this.getSourceName()] = this._expression.serialize(explain);
	return doc;
};

/**
 * Creates a new RedactDocumentSource with the input number as the skip
 *
 * @param {Number} JsonElement this thing is *called* Json, but it expects a number
 **/
klass.createFromJson = function createFromJson(jsonElement, ctx) {
	if (!jsonElement)
		throw new Error("#createFromJson requires at least one argument");

	var idGenerator = new VariablesIdGenerator(),
		vps = new VariablesParseState(idGenerator),
		currentId = vps.defineVariable("CURRENT"),
		descendId = vps.defineVariable("DESCEND"),
		pruneId = vps.defineVariable("PRUNE"),
		keepId = vps.defineVariable("KEEP");

	var expression = new Expression.parseOperand(jsonElement, vps),
		source = new RedactDocumentSource(ctx, expression);

	source._currentId = currentId;
	source._variables = new Variables(idGenerator.getIdCount());
	source._variables.setValue(descendId, DESCEND_VAL);
	source._variables.setValue(pruneId, PRUNE_VAL);
	source._variables.setValue(keepId, KEEP_VAL);

	return source;
};