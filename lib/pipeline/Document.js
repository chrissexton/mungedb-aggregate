var Document = module.exports = (function(){
	// CONSTRUCTOR
	var klass = function Document(){
		if(this.constructor == Document) throw new Error("Never create instances! Use static helpers only.");
	}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// STATIC MEMBERS
	klass.compare = function compare(l, r){
throw new Error("NOT IMPLEMENTED");
	};

	return klass;
})();
