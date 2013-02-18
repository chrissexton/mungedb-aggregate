var Op = require("../Op");

//TODO: ...write this...
var GroupOp = module.exports = (function(){
	// CONSTRUCTOR
	var base = Op, proto, klass = function GroupOp(opts){
		base.call(this, opts);
	};
	proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.write = function writeProjected(obj){
	};

	return klass;
})();
