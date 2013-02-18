var su = require("stream-utils");

var Munger = (function(){
	// CONSTRUCTOR
	var base = Object, proto, klass = function Munger(ops){
		this.ops = typeof(ops) == "object" && typeof(ops.length) === "number" ? ops : Array.prototype.slice.call(arguments, 0);
		this.opStreams = this.ops.map(function opCompiler(op, i){	//TODO: demote to local only?
			if(typeof(op) !== "object")
				throw new Error("pipeline element " + i + " is not an object");
			for(var opName in op) break;	// get first key
			if(typeof(op) === "function")
				return su.through(op);
			if(!(opName in klass.ops))
				throw new Error("Unrecognized pipeline op: " + JSON.stringify({opName:opName}));
			var IOp = klass.ops[opName];
			return new IOp(op[opName], i);
		});
console.log("OPS:", this.ops);
		this.pipeline = new su.PipelineStream(this.opStreams);
	};
	proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// STATIC MEMBERS
//	klass.ops = {
//		$skip: SkipOp,
//		$limit: LimitOp,
//		$match: MatchOp,
//		$project: ProjectOp,
//		$unwind: UnwindOp,
//		$group: GroupOp,
//		$sort: SortOp
//	};

	// PROTOTYPE MEMBERS
	proto.execute = function execute(inputs){
console.debug("\n#execute called with:", inputs);
		var outputs = [];
//TODO: why does this break things??
this.pipeline.reset();
		this.pipeline.on("data", function(data){
console.debug("PIPELINE WRITE TO OUTPUTS:", data);
			outputs.push(data);
		});
		inputs.forEach(this.pipeline.write);
console.debug("PIPELINE ENDING...");
		this.pipeline.end();
		this.pipeline.reset();
		return outputs;
	};

	return klass;
})();


module.exports = function mung(ops, inputs) {
	var munger = new Munger(ops);
	if(inputs)
		return munger.execute(inputs);
	return munger.execute.bind(munger);
};
