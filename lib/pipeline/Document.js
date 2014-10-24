"use strict";

/**
 * Represents a `Document` (i.e., an `Object`) in `mongo` but in `munge` this is only a set of static helpers since we treat all `Object`s like `Document`s.
 * @class Document
 * @namespace mungedb-aggregate.pipeline
 * @module mungedb-aggregate
 * @constructor
 **/
var Document = module.exports = function Document(){
	if(this.constructor == Document) throw new Error("Never create instances! Use static helpers only.");
}, klass = Document, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

// DEPENDENCIES
var Value = require("./Value");

// STATIC MEMBERS
/**
 * Shared "_id"
 * @static
 * @property ID_PROPERTY_NAME
 **/
klass.ID_PROPERTY_NAME = "_id";

/**
 * Return JSON representation of this Document
 *
 * @method toJson
 * @returns JSON representation of this Document
 **/
 klass.toJson = function toJson(document){
 	return JSON.stringify(document);
 };

/**
 * Return JSON representation of this Document
 *
 * @method toJsonWithMetaData
 * @returns JSON representation of this Document, with MetaData
 **/
klass.toJsonWithMetaData = function toJsonWithMetaData(document){
	//NOTE: DEVIATION FROM MONGO: Not sure how we are handling metadata
	return JSON.stringify(document);
};

/**
 * Return Document with MetaData from its JSON representation
 *
 * @method fromJsonWithMetaData
 * @returns Document with MetaData
 **/
klass.fromJsonWithMetaData = function fromJsonWithMetaData(json){
	return JSON.parse(json);
};

/**
 * Compare two documents.
 *
 * BSON document field order is significant, so this just goes through the fields in order.
 * The comparison is done in roughly the same way as strings are compared, but comparing one field at a time instead of one character at a time.
 *
 * @static
 * @method compare
 * @param rL left document
 * @param rR right document
 * @returns an integer less than zero, zero, or an integer greater than zero, depending on whether rL < rR, rL == rR, or rL > rR
 **/
klass.compare = function compare(l, r){	//TODO: might be able to replace this with a straight compare of docs using JSON.stringify()
	var lPropNames = Object.getOwnPropertyNames(l),
		lPropNamesLength = lPropNames.length,
		rPropNames = Object.getOwnPropertyNames(r),
		rPropNamesLength = rPropNames.length;

	for(var i = 0; true; ++i) {
		if (i >= lPropNamesLength) {
			if (i >= rPropNamesLength) return 0; // documents are the same length
			return -1; // left document is shorter
		}

		if (i >= rPropNamesLength) return 1; // right document is shorter

		var nameCmp = Value.compare(lPropNames[i], rPropNames[i]);
		if (nameCmp !== 0) return nameCmp; // field names are unequal

		var valueCmp = Value.compare(l[lPropNames[i]], r[rPropNames[i]]);
		if (valueCmp) return valueCmp; // fields are unequal
	}

	/* NOTREACHED */
	throw new Error("This should never happen");	//verify(false)
//		return 0;
};

/**
 * Clone a document
 * @static
 * @method clone
 * @param document
 **/
klass.clone = function(document){
	var obj = {};
	for(var key in document){
		if(document.hasOwnProperty(key)){
			var withObjVal = document[key];
			if(withObjVal === null) { // necessary to handle null values without failing
				obj[key] = withObjVal;
			}
			else if(withObjVal.constructor === Object){
				obj[key] = Document.clone(withObjVal);
			}else{
				obj[key] = withObjVal;
			}
		}
	}
	return obj;
};

//NOTE: not implementing the sorter functions until we understand sorter needs better
var _waitingOnSorter = function() {
	//TODO: When working on sorter, decide if this is needed
	throw new Error("Not implemented.");
};

klass.serializeForSorter = function(document) {
	var buffer, size = 0, key;

	//determine size for sorter??
	//for (key in document) {
    //	if (document.hasOwnProperty(key)) size++;
	//};
	//add size to buffer (don't count size field)
	//buffer = (size-1).toString();

	//add each field
	//for (key in document) {
	//	buffer += document[key]);
	//};
	//append text score?
	//return buffer;

	return JSON.stringify(document);
};

klass.deserializeForSorter = function(stringifiedDocument) {
	//_waitingOnSorter();

	//var document, size;
	//size = int.parse(stringifiedDocument.split(",")[0]);
	//document["size"] = size;
	//document = JSON.parse(stringifiedDocument);

	return JSON.parse(stringifiedDocument);
};
klass.memUsageForSorter = function(value) {
	_waitingOnSorter();
};
klass.getOwned = function() {
	return proto;
};
//	proto.addField = function addField(){ throw new Error("Instead of `Document#addField(key,val)` you should just use `obj[key] = val`"); }
//	proto.setField = function addField(){ throw new Error("Instead of `Document#setField(key,val)` you should just use `obj[key] = val`"); }
//  proto.getField = function getField(){ throw new Error("Instead of `Document#getField(key)` you should just use `var val = obj[key];`"); }
