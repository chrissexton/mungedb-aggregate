var AccumulatorSingleValue = module.exports = (function(){

	// Constructor
	/*
      This isn't a finished accumulator, but rather a convenient base class
      for others such as $first, $last, $max, $min, and similar.  It just
      provides a holder for a single Value, and the getter for that.  The
      holder is protected so derived classes can manipulate it.
     */

	var klass = module.exports = function AccumulatorSingleValue(value){
		if(arguments.length > 1 ) throw new Error("expects a single value");
		this.value = value;
		base.call(this);
	}, Accumulator = require("./Accumulator"), base = Accumulator, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var Value = require("../Value");

	proto.getValue = function getValue(){
		return this.value;
	};

	return klass;

})();


