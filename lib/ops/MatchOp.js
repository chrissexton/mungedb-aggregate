var Op = require("../Op"),
	sift = require("sift");

/** The $match operator; opts is the expression to be used when matching Objects. **/
var MatchOp = module.exports = (function(){
	// CONSTRUCTOR
	var base = Op, proto, klass = function MatchOp(opts){
		this.sifter = sift(opts);
		base.call(this, opts);
	};
	proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.write = function writeIfMatches(obj){
		if(this.sifter.test(obj))
			this.queue(obj);
	};

	return klass;
})();
