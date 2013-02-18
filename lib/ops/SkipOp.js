var Op = require("../Op");

/** The $skip operator; opts is the number of Objects to skip. **/
var SkipOp = module.exports = (function(){
	// CONSTRUCTOR
	var base = Op, proto, klass = function SkipOp(opts){
		this.n = 0;
		base.call(this, opts);
	};
	proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.write = function writeUnlessSkipped(obj){
//console.debug("$skip write:", {opIndex:this.idx, skip:this.opts, n:this.n, isSkip:(this.n < this.opts), obj:obj});
		if(this.n++ >= this.opts)
			this.queue(obj);
	};

	proto.reset = function resetSkipper(){
		this.n = 0;
	};

	return klass;
})();

