var Op = require("../Op");

/** The $limit operator; opts is the number of Objects to allow before preventing further data to pass through. **/
var LimitOp = module.exports = (function(){
	// CONSTRUCTOR
	var base = Op, proto, klass = function LimitOp(opts){
		this.n = 0;
		base.call(this, opts);
	};
	proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.write = function writeUnlessLimitted(obj){
		if(this.n++ < this.opts)
			this.queue(obj);
		//else this.end();	//TODO: this should work but we need to hook up the end event to preceeding things in the pipeline for it to function
	};
	proto.reset = function resetLimitter(){
		this.n = 0;
	};

	return klass;
})();
