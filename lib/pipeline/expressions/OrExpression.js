var OrExpression = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	* An $or pipeline expression. 
	*
	* @see evaluate 
	**/
	var klass = function OrExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var Value = require("../Value"),
		ConstantExpression = require("./ConstantExpression"),
		CoerceToBoolExpression = require("./CoerceToBoolExpression");

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$or";
	};

	/** 
	* Takes an array of one or more values and returns true if any of the values in the array are true. Otherwise $or returns false. 
	**/
	proto.evaluate = function evaluate(doc){
		for(var i = 0, n = this.operands.length; i < n; ++i){
			var value = this.operands[i].evaluate(doc);
			if(Value.coerceToBool(value)) return true;
		}
		return false;
	};

	proto.optimize = function optimize() {
		var pE = base.prototype.optimize.call(this); // optimize the disjunction as much as possible

		if (!(pE instanceof OrExpression)) return pE; // if the result isn't a disjunction, we can't do anything
		var pOr = pE;

		// Check the last argument on the result; if it's not const (as promised
		// by ExpressionNary::optimize(),) then there's nothing we can do.
		var n = pOr.operands.length;
		// ExpressionNary::optimize() generates an ExpressionConstant for {$or:[]}.
		if (!n) throw new Error("OrExpression must have operands!");
		var pLast = pOr.operands[n - 1];
		if (!(pLast instanceof ConstantExpression)) return pE;

		// Evaluate and coerce the last argument to a boolean.  If it's true, then we can replace this entire expression.
		var last = Value.coerceToBool(pLast.evaluate());
		if (last) return new ConstantExpression(true);

		// If we got here, the final operand was false, so we don't need it anymore.
		// If there was only one other operand, we don't need the conjunction either.  Note we still need to keep the promise that the result will be a boolean.
		if (n == 2) return new CoerceToBoolExpression(pOr.operands[0]);

		// Remove the final "false" value, and return the new expression.
		pOr.operands.length = n - 1;
		return pE;
	};

	proto.getFactory = function getFactory(){
		return klass;	// using the ctor rather than a separate .create() method
	};

	return klass;
})();
