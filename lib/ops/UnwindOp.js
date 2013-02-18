var Op = require("../Op");

/** The $unwind operator; opts is the $-prefixed path to the Array to be unwound. **/
var UnwindOp = module.exports = (function(){
	// CONSTRUCTOR
	var base = Op, proto, klass = function UnwindOp(opts){
		if(!opts || opts[0] != "$")
			throw new Error("$unwind: field path references must be prefixed with a '$' (" + JSON.stringify(opts) + "); code 15982");
		this.path = opts.substr(1).split(".");
		base.call(this, opts);
	};
	proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.write = function writeUnwound(obj){
		var t = traverse(obj),
			val = t.get(this.path);
		if(val !== undefined){
			if(val.constructor.name !== "Array")
				throw new Error("$unwind: value at end of field path must be an array; code 15978");
			else{
				t.set(this.path, null);	// temporarily set this to null to avoid needlessly cloning it below
				for(var i = 0, l = val.length; i < l; i++){
					var o = t.clone();
					traverse(o).set(this.path, val[i]);
					this.queue(o);
				}
				t.set(this.path, val);	// be nice and put this back on the original just in case somebody cares
			}
		}
	};

	return klass;
})();
