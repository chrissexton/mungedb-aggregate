var PushAccumulator = module.exports = (function(){

	// Constructor
	var klass = module.exports = function PushAccumulator(){
		this.values = [];
		base.call(this);
	}, Accumulator = require("./Accumulator"), base = Accumulator, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});


	proto.evaluate = function evaluate(doc){
		if(this.operands.length != 1) throw new Error("this should never happen");
		var v = this.operands[0].evaluate(doc);
		if(v)
			this.values.push(v);
	
		return null;
	};

	proto.getValue = function getValue(){
		return this.values;
	};

	proto.getOpName = function getOpName(){
		return "$push";
	};

	return klass;

})();

