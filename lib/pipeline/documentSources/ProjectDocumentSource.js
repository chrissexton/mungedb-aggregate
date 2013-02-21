var ProjectDocumentSource = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * A base class for filter document sources
	 * 
	 * @class ProjectDocumentSource
	 * @namespace munge.pipepline.documentsource
	 * @module munge
	 * @constructor
	 * @param	{ExpressionContext}	
	**/
	var klass = module.exports = ProjectDocumentSource = function ProjectDocumentSource(/*pCtx*/){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
		this.EO = new ObjectExpression();
		this.projectName = "$project";
	}, base = require('./DocumentSource'), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var ObjectExpression = require('../expressions/OjectExpression');
	var Value = require('../Value');
	var Expression = require('../expressions/Expresssion');


	/**
	 *	Returns the name of project
	 *	
	 *	@return {string} the name of project
	**/
	proto.getSourceName = function getSourceName() {
        return this.projectName;
    };

	/**
	*	Calls base document source eof()
	*	
	*	@return {bool} The result of base.pSource.eof()
	**/
	proto.eof = function eof() {
        return this.base.pSource.eof();
    };

	/**
	*	Calls base document source advance()
	*	
	*	@return {bool} The result of base.pSource.advance()
	**/
	proto.advance = function advance() {
        return this.base.pSource.advance();
    };


	/**
	*	Builds a new document(object) that represents this base document
	*	
	*	@return A document that represents this base document
	**/
	proto.getCurrent = function getCurrent() {
		inDocument = base.pSource.getCurrent();
		if (!inDocument) {
			throw new Error('inDocument must be an object');
		}

		var resultDocument = {};
		this.EO.addToDocument(resultDocument, inDocument, /*root=*/inDocument);
        return resultDocument;
    };

	/**
	 * Optimizes the internal ObjectExpression
	 *
	 * @return
	**/
	proto.optimize = function optimize() {
		this.EO.optimize();
    };

	/**
	 * Places a $project key inside the builder object with value of this.EO
	 *
	 * @method sourceToJson
	 * @param {builder} An object (was ported from BsonBuilder)
	 * @return
	**/
	proto.sourceToJson = function sourceToJson(builder, explain) {
        builder[this.projectName] = this.EO;
    };

	/**
	 * Builds a new ProjectDocumentSource from an object
	 *
	 * @method createFromJson
	 * @return a ProjectDocumentSource instance
	**/
	proto.createFromJson = function(jsonElement, expCtx) {
		if(! jsonElement instanceof Object) {
			throw new Error('Error 15969. Specification must be an object but was ' + typeof jsonElement);
		}
		var objectContext = Expression.ObjectCtx({
			isDocumentOk:true,
			isTopLevel:true,
			isInclusionOk:true
		});
		var project = new ProjectDocumentSource();
		var parsed = Expression.parseObject(jsonElement, objectContext);
		var exprObj = parsed; 
		if(!exprObj) {
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
	*
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
