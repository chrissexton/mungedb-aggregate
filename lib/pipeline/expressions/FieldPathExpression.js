"use strict";
var FieldPathExpression = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * Create a field path expression. Evaluation will extract the value associated with the given field path from the source document.
	 *
	 * @class FieldPathExpression
	 * @namespace mungedb.aggregate.pipeline.expressions
	 * @module mungedb-aggregate
	 * @extends munge.pipeline.expressions.Expression
	 * @constructor
	 * @param {String} fieldPath the field path string, without any leading document indicator
	 **/
	var klass = function FieldPathExpression(path){
		if(arguments.length !== 1) throw new Error("args expected: path");
		this.path = new FieldPath(path);
	}, base = require("./Expression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var FieldPath = require("../FieldPath");

	// PROTOTYPE MEMBERS
	proto.evaluate = function evaluate(obj){
		return this._evaluatePath(obj, 0, this.path.fields.length);
	};

	/**
	 * Internal implementation of evaluate(), used recursively.
	 *
	 * The internal implementation doesn't just use a loop because of the
	 * possibility that we need to skip over an array.  If the path is "a.b.c",
	 * and a is an array, then we fan out from there, and traverse "b.c" for each
	 * element of a:[...].  This requires that a be an array of objects in order
	 * to navigate more deeply.
	 *
	 * @param index current path field index to extract
	 * @param pathLength maximum number of fields on field path
	 * @param pDocument current document traversed to (not the top-level one)
	 * @returns the field found; could be an array
	 **/
	proto._evaluatePath = function _evaluatePath(obj, i, len){
		var fieldName = this.path.fields[i],
			field = obj[fieldName]; // It is possible we won't have an obj (document) and we need to not fail if that is the case

		// if the field doesn't exist, quit with an undefined value
		if (field === undefined) return undefined;

		// if we've hit the end of the path, stop
		if (++i >= len) return field;

		// We're diving deeper.  If the value was null, return null
		if(field === null) return undefined;

		if (field.constructor === Object) {
			return this._evaluatePath(field, i, len);
		} else if (Array.isArray(field)) {
			var results = [];
			for (var i2 = 0, l2 = field.length; i2 < l2; i2++) {
				var subObj = field[i2],
					subObjType = typeof(subObj);
				if (subObjType === "undefined" || subObj === null) {
					results.push(subObj);
				} else if (subObj.constructor === Object) {
					results.push(this._evaluatePath(subObj, i, len));
				} else {
					throw new Error("the element '" + fieldName + "' along the dotted path '" + this.path.getPath() + "' is not an object, and cannot be navigated.; code 16014");
				}
			}
			return results;
		}
		return undefined;
	};

	proto.optimize = function(){
		return this;
	};

	proto.addDependencies = function addDependencies(deps){
		deps.push(this.path.getPath());
		return deps;
	};

	// renamed write to get because there are no streams
	proto.getFieldPath = function getFieldPath(usePrefix){
		return this.path.getPath(usePrefix);
	};

	proto.toJson = function toJson(){
		return this.path.getPath(true);
	};
//TODO: proto.addToBsonObj = ...?
//TODO: proto.addToBsonArray = ...?

//proto.writeFieldPath = ...?   use #getFieldPath instead

	return klass;
})();
