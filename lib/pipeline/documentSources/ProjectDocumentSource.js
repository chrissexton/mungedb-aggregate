"use strict";
var ProjectDocumentSource = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * A base class for filter document sources
	 *
	 * @class ProjectDocumentSource
	 * @namespace mungedb-aggregate.pipeline.documentSources
	 * @module mungedb-aggregate
	 * @constructor
	 * @param [ctx] {ExpressionContext}
	 **/
	var klass = module.exports = ProjectDocumentSource = function ProjectDocumentSource(ctx){
		if(arguments.length > 1) throw new Error("up to one arg expected");
		base.call(this, ctx);
		this.EO = new ObjectExpression();
		this._raw = undefined;
	}, base = require('./DocumentSource'), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var Expression = require('../expressions/Expression');
	var ObjectExpression = require('../expressions/ObjectExpression');
	var Value = require('../Value');

	klass.projectName = "$project";
	/**
	 * Returns the name of project
	 * @return {string} the name of project
	 **/
	proto.getSourceName = function getSourceName() {
		return klass.projectName;
	};

	/**
	 * Returns the object that was used to construct the ProjectDocumentSource
	 * @return {object} the object that was used to construct the ProjectDocumentSource
	 **/
	proto.getRaw = function getRaw() {
		return this._raw;
	};

	/**
	 * Calls base document source eof()
	 * @return {bool} The result of base.source.eof()
	 **/
	proto.eof = function eof() {
		return this.source.eof();
	};

	/**
	 * Calls base document source advance()
	 * @return {bool} The result of base.source.advance()
	 **/
	proto.advance = function advance() {
		return this.source.advance();
	};


	/**
	 * Builds a new document(object) that represents this base document
	 * @return {object} A document that represents this base document
	 **/
	proto.getCurrent = function getCurrent() {
		var inDocument = this.source.getCurrent();
		if (!inDocument) throw new Error('inDocument must be an object');

		var resultDocument = {};
		this.EO.addToDocument(resultDocument, inDocument, /*root=*/inDocument);
		return resultDocument;
	};

	/**
	 * Optimizes the internal ObjectExpression
	 * @return
	 **/
	proto.optimize = function optimize() {
		this.EO.optimize();
	};

	proto.toJSON = function toJSON(){
		var obj = {};
		this.sourceToJson(obj);
		return obj;
	};

	/**
	 * Places a $project key inside the builder object with value of this.EO
	 * @method sourceToJson
	 * @param {builder} An object (was ported from BsonBuilder)
	 * @return
	 **/
	proto.sourceToJson = function sourceToJson(builder, explain) {
		var insides = this.EO.toJSON(true);
		builder[this.getSourceName()] = insides;
	};

	/**
	 * Builds a new ProjectDocumentSource from an object
	 * @method createFromJson
	 * @return {ProjectDocmentSource} a ProjectDocumentSource instance
	 **/
	klass.createFromJson = function(jsonElement, expCtx) {
		if(!(jsonElement instanceof Object) || jsonElement.constructor !== Object) {
			throw new Error('Error 15969. Specification must be an object but was ' + typeof jsonElement);
		}
		var objectContext = new Expression.ObjectCtx({
			isDocumentOk: true,
			isTopLevel: true,
			isInclusionOk: true
		});
		var project = new ProjectDocumentSource(expCtx);
		project._raw = jsonElement;
		var parsed = Expression.parseObject(jsonElement, objectContext);
		var exprObj = parsed;
		if(! exprObj instanceof ObjectExpression) {
			throw new Error("16402, parseObject() returned wrong type of Expression");
		}
		if(!exprObj.getFieldCount()) {
			throw new Error("16403, $projection requires at least one output field");
		}
		project.EO = exprObj;
		return project;
	};

	/**
	 *	Adds dependencies to the contained ObjectExpression
	 *	@param {deps} An object that is treated as a set of strings
	 *	@return A string that is part of the GetDepsReturn enum
	 **/
	proto.getDependencies = function getDependencies(deps) {
		var path = [];
		this.EO.addDependencies(deps, path);
		return base.GetDepsReturn.EXHAUSTIVE;
	};

	return klass;
})();
