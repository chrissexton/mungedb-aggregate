var Cursor = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * This class is the munge equivalent version of the mongo cursor.  Not everything is implemented
	 * since we only need bits and pieces of their functionality, but the methods that exist
	 * should be have the same as they do in mongo.  
	 * 
	 * stream-utils.throughStream should eventually be supported, but for now it will probably break things (so dont use it)
	 * 
	 * @param	{Array}	throughStreamOrArray	The array source of the data
	**/
	var klass = function Cursor(throughStreamOrArray){
		var self = this;
		
		if (!throughStreamOrArray){
			throw new Error("Cursor requires a stream-utils.ThroughStream or Array object.");
		}
		
		if (throughStreamOrArray.constructor === su.ThroughStream){
			this.throughStream = throughStreamOrArray;
			this.cachedData = [];
			
			throughStreamOrArray.on('data', function(data){
				self.cachedData.push(data);
			});
		} else if (throughStreamOrArray.constructor === Array){
			this.cachedData = throughStreamOrArray.slice(0);
		} else {
			throw new Error("Cursor requires a stream-utils.ThroughStream or Array object.");
		}
		
	}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});
	
	var su = require("stream-utils");


	proto.ok = function ok(){
		if (this.throughStream && this.throughStream.readable){
			return true;
		}
		return this.cachedData.length > 0 || this.hasOwnProperty("curr");
	};


	proto.advance = function advance(){
		if (this.cachedData.length === 0){
			delete this.curr;
			return false;
		}
		this.curr = this.cachedData.splice(0,1)[0];
		
		//TODO: CHANGE ME!!!!!
		//Note: !!BLOCKING CODE!!  need to coerce our async stream of objects into a synchronous cursor to mesh with mongos c++ish code
		while (!this.curr && this.throughStream && this.throughStream.readable){
			this.curr = this.cachedData.splice(0,1)[0];
		}
		
		return this.curr;
	};
	
	proto.current = function current(){
		if (!this.hasOwnProperty("curr")){
			this.advance();
		}
		return this.curr;
	};
	
	
	return klass;
})();