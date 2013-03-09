var IndexOfExpression = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * An $indexOf pipeline expression.
	 *
	 * @see evaluate
	 * @class IndexOfExpression
	 * @namespace munge.pipeline.expressions
	 * @module munge
	 * @constructor
	**/
	var klass = function IndexOfExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$indexOf";
	};

	proto.addOperand = function addOperand(expr) {
		this.checkArgLimit(2);
		base.prototype.addOperand.call(this, expr);
	};

	/**
	* Use the $indexOf operator with the following syntax: { $indexOf: [ <needle>, <haystack> ] }
	* @method evaluate
	**/
	proto.evaluate = function evaluate(doc){
		this.checkArgCount(2);

		var left = this.operands[0].evaluate(doc);
		if (left === undefined) return undefined;

		var right = this.operands[1].evaluate(doc);
		if (right === undefined) return undefined;
		if (!(right instanceof Array)) throw new Error("UserAssertion: expected the 2nd arg of the $indexOf expression to be an Array but got " + (typeof right === "object" ? right.constructor.name : typeof right));

		return right.indexOf(left);
	};

	return klass;
})();
