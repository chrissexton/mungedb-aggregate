var CoerceToBoolExpression = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	 * internal expression for coercing things to booleans 
	 *
	 * @class CoerceToBoolExpression
	 * @namespace munge.pipeline.expressions
	 * @module munge
	 * @constructor
	**/
	var klass = module.exports = function CoerceToBoolExpression(expression){
		if(arguments.length !== 1) throw new Error("args expected: expression");
		this.expression = expression;
		base.call(this);
	}, base = require("./Expression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var Value = require("../Value"),
		AndExpression = require("./AndExpression"),
		OrExpression = require("./OrExpression"),
		NotExpression = require("./NotExpression");

	// PROTOTYPE MEMBERS
	proto.evaluate = function evaluate(doc){
		var result = this.expression.evaluate(doc);
		return Value.coerceToBool(result);
	};

	proto.optimize = function optimize() {
        this.expression = this.expression.optimize();	// optimize the operand

		// if the operand already produces a boolean, then we don't need this
		// LATER - Expression to support a "typeof" query?
		var expr = this.expression;
		if(expr instanceof AndExpression ||
				expr instanceof OrExpression ||
				expr instanceof NotExpression ||
				expr instanceof CoerceToBoolExpression)
			return expr;
		return this;
	};

	proto.addDependencies = function addDependencies(deps, path) {
		return this.expression.addDependencies(deps);
	};

	proto.toJson = function toJson() {
		// Serializing as an $and expression which will become a CoerceToBool
		return {$and:[this.expression.toJson()]};
	};
//TODO:	proto.addToBsonObj   --- may be required for $project to work
//TODO:	proto.addToBsonArray

	return klass;
})();
