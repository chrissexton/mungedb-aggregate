var ConstantExpression = module.exports = (function(){
	// CONSTRUCTOR
	/** 
	 * Internal expression for constant values 
	 *
	 * @class ConstantExpression
	 * @namespace munge.pipeline.expressions
	 * @module munge
	 * @constructor
	**/
	var klass = function ConstantExpression(value){
		if(arguments.length !== 1) throw new Error("args expected: value");
		this.value = value;	//TODO: actually make read-only in terms of JS?
		base.call(this);
	}, base = require("./Expression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.getOpName = function getOpName(){
		return "$const";
	};

	/**
	* Get the constant value represented by this Expression.
	*
	* @returns the value
	**/
	proto.getValue = function getValue(){	//TODO: convert this to an instance field rather than a property
		return this.value;
	};

	proto.addDependencies = function addDependencies(deps, path) {
		// nothing to do
	};

	/** Get the constant value represented by this Expression. **/
	proto.evaluate = function evaluate(doc){
		return this.value;
	};

	proto.optimize = function optimize() {
		return this; // nothing to do
	};

	proto.toJson = function(isExpressionRequired){
		return isExpressionRequired ? {$const: this.value} : this.value;
	};
//TODO:	proto.addToBsonObj   --- may be required for $project to work -- my hope is that we can implement toJson methods all around and use that instead
//TODO:	proto.addToBsonArray


	return klass;
})();
