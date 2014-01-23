"use strict";

/**
 * This class is a simplified implementation of the cursors used in MongoDB for reading from an Array of documents.
 * @param	{Array}	items	The array source of the data
 **/
var klass = module.exports = function Cursor(items){
	if (!(items instanceof Array)) throw new Error("arg `items` must be an Array");
	this.cachedData = items.slice(0);	// keep a copy so array changes when using async doc srcs do not cause side effects
	this.length = items.length;
	this.offset = 0;
}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

proto.ok = function ok(){
	return (this.offset < this.length) || this.hasOwnProperty("curr");
};

proto.advance = function advance(){
	if (this.offset >= this.length){
		delete this.curr;
		return false;
	}
	this.curr = this.cachedData[this.offset++];
	return this.curr;
};

proto.current = function current(){
	if (!this.hasOwnProperty("curr")) this.advance();
	return this.curr;
};
