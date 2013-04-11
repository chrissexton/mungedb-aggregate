"use strict";
var FieldPath = module.exports = FieldPath = (function(){
	// CONSTRUCTOR
	/**
	 * Constructor for field paths.
	 *
	 * The constructed object will have getPathLength() > 0.
	 * Uassert if any component field names do not pass validation.
	 *
	 * @class FieldPath
	 * @namespace mungedb.aggregate.pipeline
	 * @module mungedb-aggregate
	 * @constructor
	 * @param fieldPath the dotted field path string or non empty pre-split vector.
	 **/
	var klass = function FieldPath(path){
		var fields = typeof(path) === "object" && typeof(path.length) === "number" ? path : path.split(".");
		if(fields.length === 0) throw new Error("FieldPath cannot be constructed from an empty vector (String or Array).; code 16409");
		for(var i = 0, n = fields.length; i < n; ++i){
			var field = fields[i];
			if(field.length === 0) throw new Error("FieldPath field names may not be empty strings; code 15998");
			if(field[0] == "$") throw new Error("FieldPath field names may not start with '$'; code 16410");
			if(field.indexOf("\0") != -1) throw new Error("FieldPath field names may not contain '\\0'; code 16411");
			if(field.indexOf(".") != -1) throw new Error("FieldPath field names may not contain '.'; code 16412");
		}
		this.path = path;
		this.fields = fields;
	}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// STATIC MEMBERS
	klass.PREFIX = "$";

	// PROTOTYPE MEMBERS
	/**
	 * Get the full path.
	 *
	 * @method getPath
	 * @param fieldPrefix whether or not to include the field prefix
	 * @returns the complete field path
	 **/
	proto.getPath = function getPath(withPrefix) {
		return ( !! withPrefix ? FieldPath.PREFIX : "") + this.fields.join(".");
	};

	/**
	 * A FieldPath like this but missing the first element (useful for recursion). Precondition getPathLength() > 1.
	 *
	 * @method tail
	 **/
	proto.tail = function tail() {
		return new FieldPath(this.fields.slice(1));
	};

	/**
	 * Get a particular path element from the path.
	 *
	 * @method getFieldName
	 * @param i the zero based index of the path element.
	 * @returns the path element
	 **/
	proto.getFieldName = function getFieldName(i){	//TODO: eventually replace this with just using .fields[i] directly
		return this.fields[i];
	};

	/**
	 * Get the number of path elements in the field path.
	 *
	 * @method getPathLength
	 * @returns the number of path elements
	 **/
	proto.getPathLength = function getPathLength() {
		return this.fields.length;
	};

	return klass;
})();
