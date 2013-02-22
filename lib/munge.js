var PipelineCommand = require('./commands/PipelineCommand');

var Munger = (function(){
	// CONSTRUCTOR
	var base = Object, proto, klass = function Munger(ops){
		if (!ops){
			throw new Error("munge requires a pipeline!");
		}
		if (typeof ops.length !== "number"){
			ops = [ops];
		}
		this.pipeline = new PipelineCommand(ops);
	};
	proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PROTOTYPE MEMBERS
	proto.execute = function execute(inputs){
		var result = {};
		result.ok = this.pipeline.run(inputs, result);
		//return result;	//TODO: figure out if we want mongo style result or a simpler one.
		return result.result;
	};

	return klass;
})();


module.exports = function munge(ops, inputs) {
	var munger = new Munger(ops);
	if(inputs)
		return munger.execute(inputs);
	return munger.execute.bind(munger);
};
