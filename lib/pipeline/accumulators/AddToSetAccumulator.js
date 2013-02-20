var sha3 = require('sha3'),
	AddToSetAccumulator = module.exports = (function(){

	// Constructor
	var klass = module.exports = function AddToSetAccumulator(){
		this.set = {};
		base.call(this);
	}, Accumulator = require("./Accumulator"), base = Accumulator, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});


	proto.evaluate = function evaluate(doc){
		if(this.operands.length != 1) throw new Error("this should never happen");
		var v = this.operands[0].evaluate(doc);
		if(v)
			this.set[this._getHashForObject(v)] = v; 
	
		return null;
	};

	proto._getHashForObject = function _getHashForObject(obj){ 
		// TODO: This uses JSON.stringify which is going to be really slow for any signficant amount of data
		// Need to figure out a better way to do hasing in Javascript for objects
		var d = new sha3.SHA3Hash();
		d.update(JSON.stringify(obj));
		return d.digest('hex');
	};

	proto.getValue = function getValue(){
		var values = [], n = 0;
		for(var key in this.set){
			if(this.set.hasOwnProperty(key)) values[n++] = this.set[key];
		}
		return values;
	};

	proto.getOpName = function getOpName(){
		return "$addToSet";
	};

	return klass;

})();







