var su = require("stream-utils");

/** A base class for all pipeline operators; Handles top-level pipeline operator definitions to provide a Stream that transforms Objects **/
var Op = module.exports = (function(){
	// CONSTRUCTOR
	var base = su.ThroughStream, proto, klass = function Op(opts){
		this.opts = opts;
		base.call(this, {write:this.write, end:this.end, reset:this.reset});
	};
	proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	//NOTE: see the stream-utils's through() docs for more info
	//proto.write = function(obj){ this.queue(obj); }
	//proto.end = function(){ this.queue("LAST"); }
	//proto.reset = function(){ this.queue("LAST"); }

	return klass;
})();

