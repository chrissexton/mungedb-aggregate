var Op = require("../../Op");

//TODO: ...write this...
var ProjectOp = module.exports = (function(){
	// CONSTRUCTOR
	var base = Op, proto, klass = function ProjectOp(opts){
		base.call(this, opts);
	};
	proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// STATIC MEMBERS
	klass.expressions = undefined; //TODO: ...

	// PROTOTYPE MEMBERS
	proto.write = function writeProjected(obj){
	};

	return klass;
})();
