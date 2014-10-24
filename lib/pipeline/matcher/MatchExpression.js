"use strict";

// Autogenerated by cport.py on 2013-09-17 14:37
var MatchExpression = module.exports = function MatchExpression( type ){
	this._matchType = type;
}, klass = MatchExpression, base =  Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

// DEPENDENCIES
var errors = require("../../Errors.js"),
	ErrorCodes = errors.ErrorCodes;

	// File: expression.h lines: 172-172
proto._matchType = undefined;

// File: expression.h lines: 173-173
proto._tagData = undefined;

/**
 *
 * Writes a debug string for this object
 * @method debugString
 * @param level
 *
 */
proto._debugAddSpace = function _debugAddSpace(level){
	// File: expression.cpp lines: 37-39
	return new Array( level + 1).join("    ");
};

/**
 *
 * Get our child elements
 * @method getChild
 *
 */
proto.getChild = function getChild() {
	// File: expression.h lines: 78-77
	throw new Error('Virtual function called.');
};


/**
 *
 * Return the _tagData property
 * @method getTag
 *
 */
proto.getTag = function getTag(){
	// File: expression.h lines: 159-158
	return this._tagData;
};

/**
 *
 * Return if our _matchType needs an array
 * @method isArray
 *
 */
proto.isArray = function isArray(){
	// File: expression.h lines: 111-113
	switch (this._matchType){
		case 'SIZE':
		case 'ALL':
		case 'ELEM_MATCH_VALUE':
		case 'ELEM_MATCH_OBJECT':
			return true;
		default:
			return false;
	}

	return false;
};

/**
 *
 * Check if we do not need an array, and we are not a logical element (leaves are very emotional)
 * @method isLeaf
 *
 */
proto.isLeaf = function isLeaf(){
	// File: expression.h lines: 124-125
	return !this.isArray() && !this.isLogical();
};

/**
 *
 * Check if we are a vulcan
 * @method isLogical
 *
 */
proto.isLogical = function isLogical(){
	// File: expression.h lines: 100-101
	switch( this._matchType ){
		case 'AND':
		case 'OR':
		case 'NOT':
		case 'NOR':
			return true;
		default:
			return false;
	}
	return false;
};

/**
 *
 * Return the _matchType property
 * @method matchType
 *
 */
proto.matchType = function matchType(){
	// File: expression.h lines: 67-66
	return this._matchType;
};

/**
 *
 * Wrapper around matches function
 * @method matchesBSON
 * @param
 *
 */
proto.matchesBSON = function matchesBSON(doc, details){
	// File: expression.cpp lines: 42-44
	return this.matches(doc, details);
};

/**
 *
 * Return the number of children we have
 * @method numChildren
 *
 */
proto.numChildren = function numChildren( ){
	// File: expression.h lines: 73-72
	return 0;
};

/**
 *
 * Return our internal path
 * @method path
 *
 */
proto.path = function path( ){
	// File: expression.h lines: 83-82
	return '';
};

/**
 *
 * Set the _tagData property
 * @method setTag
 * @param data
 *
 */
proto.setTag = function setTag(data){
	// File: expression.h lines: 158-157
	this._tagData = data;
};

/**
 *
 * Call the debugString method
 * @method toString
 *
 */
proto.toString = function toString(){
	// File: expression.cpp lines: 31-34
	return this.debugString( 0 );
};
