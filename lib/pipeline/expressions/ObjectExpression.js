var ObjectExpression = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * Create an empty expression.  Until fields are added, this will evaluate to an empty document (object).
	 *
	 * @class ObjectExpression
	 * @namespace mungedb.aggregate.pipeline.expressions
	 * @module mungedb-aggregate
	 * @extends munge.pipeline.expressions.Expression
	 * @constructor
	 **/
	var klass = function ObjectExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		this.excludeId = false;	/// <Boolean> for if _id is to be excluded
		this._expressions = {};	/// <Object<Expression>> mapping from fieldname to Expression to generate the value NULL expression means include from source document
		this._order = []; /// <Array<String>> this is used to maintain order for generated fields not in the source document
	}, Expression = require("./Expression"), base = Expression, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var Document = require("../Document"),
		FieldPath = require("../FieldPath");

	// INSTANCE VARIABLES
	/**
	 * <Boolean> for if _id is to be excluded
	 *
	 * @property excludeId
	 **/
	proto.excludeId = undefined;

	/**
	 * <Object<Expression>> mapping from fieldname to Expression to generate the value NULL expression means include from source document
	 **/
	proto._expressions = undefined;

	//TODO: might be able to completely ditch _order everywhere in here since `Object`s are mostly ordered anyhow but need to come back and revisit that later
	/**
	 * <Array<String>> this is used to maintain order for generated fields not in the source document
	 **/
	proto._order = [];


	// PROTOTYPE MEMBERS

	/**
	 * evaluate(), but return a Document instead of a Value-wrapped Document.
	 *
	 * @method evaluateDocument
	 * @param pDocument the input Document
	 * @returns the result document
	 **/
	proto.evaluateDocument = function evaluateDocument(doc) {
		// create and populate the result
		var pResult = {};
		this.addToDocument(pResult, pResult, doc); // No inclusion field matching.
		return pResult;
	};

	proto.evaluate = function evaluate(doc) { //TODO: collapse with #evaluateDocument()?
		return this.evaluateDocument(doc);
	};

	proto.optimize = function optimize(){
		for (var key in this._expressions) {
			var expr = this._expressions[key];
			if (expr !== undefined && expr !== null) this._expressions[key] = expr.optimize();
		}
		return this;
	};

	proto.getIsSimple = function getIsSimple(){
		for (var key in this._expressions) {
			var expr = this._expressions[key];
			if (expr !== undefined && expr !== null && !expr.getIsSimple()) return false;
		}
		return true;
	};

	proto.addDependencies = function addDependencies(deps, path){
		var depsSet = {};
		var pathStr = "";
		if (path instanceof Array) {
			if (path.length === 0) {
				// we are in the top level of a projection so _id is implicit
				if (!this.excludeId) depsSet[Document.ID_PROPERTY_NAME] = 1;
			} else {
				pathStr = new FieldPath(path).getPath() + ".";
			}
		} else {
			if (this.excludeId) throw new Error("excludeId is true!");
		}
		for (var key in this._expressions) {
			var expr = this._expressions[key];
			if (expr !== undefined && expr !== null) {
				if (path instanceof Array) path.push(key);
				expr.addDependencies(deps, path);
				if (path instanceof Array) path.pop();
			} else { // inclusion
				if (path === undefined || path === null) throw new Error("inclusion not supported in objects nested in $expressions; uassert code 16407");
				depsSet[pathStr + key] = 1;
			}
		}
		//Array.prototype.push.apply(deps, Object.getOwnPropertyNames(depsSet));
		for(key in depsSet) {
			deps[key] = 1;
		}
		return deps;	// NOTE: added to munge as a convenience
	};

	/**
	 * evaluate(), but add the evaluated fields to a given document instead of creating a new one.
	 *
	 * @method addToDocument
	 * @param pResult the Document to add the evaluated expressions to
	 * @param pDocument the input Document for this level
	 * @param rootDoc the root of the whole input document
	 **/
	proto.addToDocument = function addToDocument(pResult, pDocument, rootDoc){
		var atRoot = (pDocument === rootDoc);

		var doneFields = {};	// This is used to mark fields we've done so that we can add the ones we haven't

		for(var fieldName in pDocument){
			if (!pDocument.hasOwnProperty(fieldName)) continue;
			var fieldValue = pDocument[fieldName];

			// This field is not supposed to be in the output (unless it is _id)
			if (!this._expressions.hasOwnProperty(fieldName)) {
				if (!this.excludeId && atRoot && fieldName == Document.ID_PROPERTY_NAME) {
					// _id from the root doc is always included (until exclusion is supported)
					// not updating doneFields since "_id" isn't in _expressions
					pResult[fieldName] = fieldValue;
				}
				continue;
			}

			// make sure we don't add this field again
			doneFields[fieldName] = true;

			// This means pull the matching field from the input document
			var expr = this._expressions[fieldName];
			if (!(expr instanceof Expression)) {
				pResult[fieldName] = fieldValue;
				continue;
			}

			// Check if this expression replaces the whole field
			if ((fieldValue.constructor !== Object && fieldValue.constructor !== Array) || !(expr instanceof ObjectExpression)) {
				var pValue = expr.evaluate(rootDoc);

				// don't add field if nothing was found in the subobject
				if (expr instanceof ObjectExpression && pValue instanceof Object && Object.getOwnPropertyNames(pValue).length === 0) continue;

				// Don't add non-existent values (note:  different from NULL); this is consistent with existing selection syntax which doesn't force the appearnance of non-existent fields.
				// TODO make missing distinct from Undefined
				if (pValue !== undefined) pResult[fieldName] = pValue;
				continue;
			}

			// Check on the type of the input value.  If it's an object, just walk down into that recursively, and add it to the result.
			if (fieldValue.constructor === Object) {
				pResult[fieldName] = expr.addToDocument({}, fieldValue, rootDoc);	//TODO: pretty sure this is broken;
			} else if (fieldValue.constructor == Array) {
				// If it's an array, we have to do the same thing, but to each array element.  Then, add the array of results to the current document.
				var result = [];
				for(var fvi = 0, fvl = fieldValue.length; fvi < fvl; fvi++){
					var subValue = fieldValue[fvi];
					if (subValue.constructor !== Object) continue;	// can't look for a subfield in a non-object value.
					result.push(expr.addToDocument({}, subValue, rootDoc));
				}
				pResult[fieldName] = result;
			} else {
				throw new Error("should never happen");	//verify( false );
			}
		}

		if (Object.getOwnPropertyNames(doneFields).length == Object.getOwnPropertyNames(this._expressions).length) return pResult;	//NOTE: munge returns result as a convenience

		// add any remaining fields we haven't already taken care of
		for(var i = 0, l = this._order.length; i < l; i++){
			var fieldName2 = this._order[i];
			var expr2 = this._expressions[fieldName2];

			// if we've already dealt with this field, above, do nothing
			if (doneFields.hasOwnProperty(fieldName2)) continue;

			// this is a missing inclusion field
			if (!expr2) continue;

			var value = expr2.evaluate(rootDoc);

			// Don't add non-existent values (note:  different from NULL); this is consistent with existing selection syntax which doesn't force the appearnance of non-existent fields.
			if (value === undefined) continue;

			// don't add field if nothing was found in the subobject
			if (expr2 instanceof ObjectExpression && value && value instanceof Object && Object.getOwnPropertyNames(value).length === 0) continue;

			pResult[fieldName2] = value;
		}

		return pResult;	//NOTE: munge returns result as a convenience
	};

	/**
	 * estimated number of fields that will be output
	 *
	 * @method getSizeHint
	 **/
	proto.getSizeHint = function getSizeHint(){
		// Note: this can overestimate, but that is better than underestimating
		return Object.getOwnPropertyNames(this._expressions).length + (this.excludeId ? 0 : 1);
	};

	/**
	 * Add a field to the document expression.
	 *
	 * @method addField
	 * @param fieldPath the path the evaluated expression will have in the result Document
	 * @param pExpression the expression to evaluate obtain this field's Value in the result Document
	 **/
	proto.addField = function addField(fieldPath, pExpression){
		if(!(fieldPath instanceof FieldPath)) fieldPath = new FieldPath(fieldPath);
		var fieldPart = fieldPath.fields[0],
			haveExpr = this._expressions.hasOwnProperty(fieldPart),
			subObj = this._expressions[fieldPart];	// inserts if !haveExpr //NOTE: not in munge & JS it doesn't, handled manually below

		if (!haveExpr) {
			this._order.push(fieldPart);
		} else { // we already have an expression or inclusion for this field
			if (fieldPath.getPathLength() == 1) { // This expression is for right here
				if (!(subObj instanceof ObjectExpression && typeof pExpression == "object" && pExpression instanceof ObjectExpression)) throw new Error("can't add an expression for field `" + fieldPart + "` because there is already an expression for that field or one of its sub-fields; uassert code 16400"); // we can merge them

				// Copy everything from the newSubObj to the existing subObj
				// This is for cases like { $project:{ 'b.c':1, b:{ a:1 } } }
				for(var key in pExpression._expressions){
					if(pExpression._expressions.hasOwnProperty(key)){
						// asserts if any fields are dupes
						subObj.addField(key, pExpression._expressions[key]);
					}
				}
				return;
			} else { // This expression is for a subfield
				if(!subObj) throw new Error("can't add an expression for a subfield of `" + fieldPart + "` because there is already an expression that applies to the whole field; uassert code 16401");
			}
		}

		if (fieldPath.getPathLength() == 1) {
			if(haveExpr) throw new Error("Internal error."); // haveExpr case handled above.
			this._expressions[fieldPart] = pExpression;
			return;
		}

		if (!haveExpr) subObj = this._expressions[fieldPart] = new ObjectExpression();

		subObj.addField(fieldPath.tail(), pExpression);
	};

	/**
	 * Add a field path to the set of those to be included.
	 *
	 * Note that including a nested field implies including everything on the path leading down to it.
	 *
	 * @method includePath
	 * @param fieldPath the name of the field to be included
	 **/
	proto.includePath = function includePath(path){
		this.addField(path, undefined);
	};

	/**
	 * Get a count of the added fields.
	 *
	 * @method getFieldCount
	 * @returns how many fields have been added
	 **/
	proto.getFieldCount = function getFieldCount(){
		return Object.getOwnPropertyNames(this._expressions).length;
	};

///**
//* Specialized BSON conversion that allows for writing out a $project specification.
//* This creates a standalone object, which must be added to a containing object with a name
//*
//* @param pBuilder where to write the object to
//* @param requireExpression see Expression::addToBsonObj
//**/
//TODO:	proto.documentToBson = ...?
//TODO:	proto.addToBsonObj = ...?
//TODO: proto.addToBsonArray = ...?

//NOTE: in `munge` we're not passing the `Object`s in and allowing `toJson` (was `documentToBson`) to modify it directly and are instead building and returning a new `Object` since that's the way it's actually used
proto.toJson = function toJson(requireExpression){
	var o = {};
	if(this.excludeId)
		o[Document.ID_PROPERTY_NAME] = false;
	for(var i = 0, l = this._order.length; i < l; i++){
		var fieldName = this._order[i];
		if(!this._expressions.hasOwnProperty(fieldName)) throw new Error("internal error: fieldName from _ordered list not found in _expressions");
		var fieldValue = this._expressions[fieldName];
		if(fieldValue === undefined){
			// this is inclusion, not an expression
            o[fieldName] = true;
		}else{
			o[fieldName] = fieldValue.toJson(requireExpression);
		}
	}
	return o;
};

//TODO: where's toJson? or is that what documentToBson really is up above?

	return klass;
})();
