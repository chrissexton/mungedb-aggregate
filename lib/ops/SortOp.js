var Op = require("../Op"),
	traverse = require("traverse");

//TODO: ...write this...
var SortOp = module.exports = (function(){
	// CONSTRUCTOR
	var base = Op, proto, klass = function SortOp(opts){
			// Parse sorts from options object
			if(typeof(opts) !== "object") throw new Error("the $sort key specification must be an object");
			this.sorts = [];
			for(var p in opts){
				if(p[0] === "$") throw new Error("$sort: FieldPath field names may not start with '$'.; code 16410");
				if(p === "") throw new Error("$sort: FieldPath field names may not be empty strings.; code 15998");
				this.sorts.push({path:p.split("."), direction:opts[p]});
			}
console.log("SORTS FOR $sort OP:", this.sorts);
			this.objs = [];
			base.call(this, opts);
	};
	proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PRIVATE STUFF
	// Helpers for sorting
	var types = ["undefined", "null", "NaN", "number", "string", "object", "boolean", "Date"];
	function getTypeOf(o){
		if(o === undefined) return "undefined";
		if(o === null) return "null";
		if(isNaN(o)) return "NaN";
		if(o.constructor === Date) return "Date";
		return typeof(o);
	}

	// PROTOTYPE MEMBERS
	proto.write = function writeDeferredForSorting(obj){
console.log("$sort deferring:", obj);
		this.objs.push(obj);
	};

	proto.end = function endSort(obj){
console.log("$sort end event");
		if(this.objs.length){
			console.log("OBJS TO BE SORTED:", this.objs);
			this.objs.sort(function(a, b){
				for(var i = 0, l = this.sorts.length; i < l; i++){
					//TODO: this probably needs to compareDeep using traverse(a).forEach(...check b...) or similar
					var sort = this.sorts[i],
						aVal = traverse(a).get(sort.path), aType = getTypeOf(aVal),
						bVal = traverse(b).get(sort.path), bType = getTypeOf(bVal);
					// null and undefined go first
					if(aType !== bType){
						return (types.indexOf(aType) - types.indexOf(bType)) * sort.direction;
					}else{
						// don't trust type cohersion
						if(aType == "number") bVal = parseFloat(bVal);
						if(isNaN(bVal)) return 1;
						if(aType == "string") bVal = bVal.toString();
						// return sort value only if it can be determined at this level
						if(aVal < bVal) return -1 * sort.direction;
						if(aVal > bVal) return 1 * sort.direction;
					}
				}
				return 0;
			});
console.log("$sort has sorted");
			for(var i = 0, l = this.objs.length; i < l; i++)
				this.queue(this.objs[i]);
		}
		this.end();
	};

	return klass;
})();
