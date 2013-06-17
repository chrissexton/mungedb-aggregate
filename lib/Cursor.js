"use strict";
var Cursor = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * This class is a simplified implementation of the cursors used in MongoDB for reading from an Array of documents.
	 * @param	{Array}	items	The array source of the data
	 **/
	var klass = function Cursor(items){
		var self = this;
		if (!(items instanceof Array)) throw new Error("arg `items` must be an Array");
		this.cachedData = items.slice(0);	// keep a copy
	}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	proto.ok = function ok(){
		return this.cachedData.length > 0 || this.hasOwnProperty("curr");
	};

	proto.advance = function advance(){
		if (this.cachedData.length === 0){
			delete this.curr;
			return false;
		}
		this.curr = this.cachedData.shift();
		return this.curr;
	};

	proto.current = function current(){
		if (!this.hasOwnProperty("curr")) this.advance();
		return this.curr;
	};

	return klass;
})();
