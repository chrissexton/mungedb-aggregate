var CompareExpression = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * Generic comparison expression that gets used for $eq, $ne, $lt, $lte, $gt, $gte, and $cmp. 
	 *
	 * @class CompareExpression
	 * @namespace munge.pipeline.expressions
	 * @module munge
	 * @constructor
	**/
	var klass = module.exports = CompareExpression = function CompareExpression(cmpOp) {
		if(arguments.length !== 1) throw new Error("args expected: cmpOp");
		this.cmpOp = cmpOp;
		base.call(this);
	}, base = require("./NaryExpression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var Value = require("../Value"),
		Expression = require("./Expression"),
		ConstantExpression = require("./ConstantExpression"),
		FieldPathExpression = require("./FieldPathExpression"),
		FieldRangeExpression = require("./FieldRangeExpression");

	// NESTED CLASSES
	/**
	* Lookup table for truth value returns
	*
	* @param truthValues	truth value for -1, 0, 1
	* @param reverse		reverse comparison operator
	* @param name			string name
	**/
	var CmpLookup = (function(){	// emulating a struct
		// CONSTRUCTOR
		var klass = function CmpLookup(truthValues, reverse, name) {
			if(arguments.length !== 3) throw new Error("args expected: truthValues, reverse, name");
			this.truthValues = truthValues;
			this.reverse = reverse;
			this.name = name;
		}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});
		return klass;
	})();

	// PRIVATE STATIC MEMBERS
	/** a table of cmp type lookups to truth values **/
	var cmpLookupMap = [	//NOTE: converted from this Array to a Dict/Object below using CmpLookup#name as the key
		//              -1      0      1      reverse             name     (taking advantage of the fact that our 'enums' are strings below)
		new CmpLookup([false, true, false], Expression.CmpOp.EQ, Expression.CmpOp.EQ),
		new CmpLookup([true, false, true], Expression.CmpOp.NE, Expression.CmpOp.NE),
		new CmpLookup([false, false, true], Expression.CmpOp.LT, Expression.CmpOp.GT),
		new CmpLookup([false, true, true], Expression.CmpOp.LTE, Expression.CmpOp.GTE),
		new CmpLookup([true, false, false], Expression.CmpOp.GT, Expression.CmpOp.LT),
		new CmpLookup([true, true, false], Expression.CmpOp.GTE, Expression.CmpOp.LTE),
		new CmpLookup([false, false, false], Expression.CmpOp.CMP, Expression.CmpOp.CMP)
	].reduce(function(r,o){r[o.name]=o;return r;},{});


	// PROTOTYPE MEMBERS
	proto.addOperand = function addOperand(expr) {
		this.checkArgLimit(2);
		base.prototype.addOperand.call(this, expr);
	};

	proto.evaluate = function evaluate(doc) {
		this.checkArgCount(2);
		var left = this.operands[0].evaluate(doc),
			right = this.operands[1].evaluate(doc),
			cmp = Expression.signum(Value.compare(left, right));
		if (this.cmpOp == Expression.CmpOp.CMP) return cmp;
		return cmpLookupMap[this.cmpOp].truthValues[cmp + 1] || false;
	};

	proto.optimize = function optimize(){
		var expr = base.prototype.optimize.call(this); // first optimize the comparison operands
		if (!(expr instanceof CompareExpression)) return expr; // if no longer a comparison, there's nothing more we can do.

		// check to see if optimizing comparison operator is supported	// CMP and NE cannot use ExpressionFieldRange which is what this optimization uses
		var newOp = this.cmpOp;
		if (newOp == Expression.CmpOp.CMP || newOp == Expression.CmpOp.NE) return expr;

		// There's one localized optimization we recognize:  a comparison between a field and a constant.  If we recognize that pattern, replace it with an ExpressionFieldRange.
        // When looking for this pattern, note that the operands could appear in any order.  If we need to reverse the sense of the comparison to put it into the required canonical form, do so.
		var leftExpr = this.operands[0],
			rightExpr = this.operands[1];
		var fieldPathExpr, constantExpr;
		if (leftExpr instanceof FieldPathExpression) {
			fieldPathExpr = leftExpr;
			if (!(rightExpr instanceof ConstantExpression)) return expr; // there's nothing more we can do
			constantExpr = rightExpr;
		} else {
			// if the first operand wasn't a path, see if it's a constant
			if (!(leftExpr instanceof ConstantExpression)) return expr; // there's nothing more we can do
			constantExpr = leftExpr;

			// the left operand was a constant; see if the right is a path
			if (!(rightExpr instanceof FieldPathExpression)) return expr; // there's nothing more we can do
			fieldPathExpr = rightExpr;

			// these were not in canonical order, so reverse the sense
			newOp = cmpLookupMap[newOp].reverse;
		}
		return new FieldRangeExpression(fieldPathExpr, newOp, constantExpr.getValue());
	};

	proto.getOpName = function getOpName(){
		return this.cmpOp;
	};

	return klass;
})();
