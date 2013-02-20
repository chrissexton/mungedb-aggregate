var Value = module.exports = Value = (function(){
	//DEPENDENCIES
	var SHA3 = require('sha3');

	// CONSTRUCTOR
	var klass = function Value(){
		if(this.constructor == Value) throw new Error("Never create instances of this! Use the static helpers only.");
	}, base = Object, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// PRIVATE STUFF
	function getTypeVerifier(type, IClass, isStrict) {
		return function verifyType(value) {
			if (typeof(value) != type) throw new Error("typeof value is not: " + type + "; actual: " + typeof(value));
			if (typeof(IClass) == "function" && !(isStrict ? value.constructor == IClass : value instanceof IClass)) throw new Error("instanceof value is not: " + IClass.name + "; actual: " + value.constructor.name);
			return value;
		};
	}

	// STATIC MEMBERS
	klass.verifyNumber = getTypeVerifier("number", Number);	//NOTE: replaces #getDouble(), #getInt(), and #getLong()
	klass.verifyString = getTypeVerifier("string", String);
	klass.verifyDocument = getTypeVerifier("object", Object, true);	//TODO: change to verifyDocument?
	klass.verifyArray = getTypeVerifier("object", Array, true);
	klass.verifyDate = getTypeVerifier("object", Date, true);
	klass.verifyRegExp = getTypeVerifier("object", RegExp, true);	//NOTE: renamed from #getRegex()
//TODO:	klass.verifyOid = ...?
//TODO:	klass.VerifyTimestamp = ...?
	klass.verifyBool = getTypeVerifier("boolean", Boolean, true);

	klass.coerceToBool = function coerceToBool(value) {
		if (typeof(value) == "string") return true;
		return !!value;	// including null or undefined
	};
	klass.coerceToInt =
	klass.coerceToLong =
	klass.coerceToDouble =
	klass._coerceToNumber = function _coerceToNumber(value) { //NOTE: replaces .coerceToInt(), .coerceToLong(), and .coerceToDouble()
		if (value === null) return 0;
		switch (typeof(value)) {
		case "undefined":
			return 0;
		case "number":
			return value;
		default:
			throw new Error("can't convert from BSON type " + typeof(value) + " to int; codes 16003, 16004, 16005");
		}
	};
	klass.coerceToDate = function coerceToDate(value) {
		//TODO: Support Timestamp BSON type?
		if (value instanceof Date) return value;
		throw new Error("can't convert from BSON type " + typeof(value) + " to Date; codes 16006");
	};
//TODO: klass.coerceToTimeT = ...?   try to use as Date first rather than having coerceToDate return Date.parse  or dateObj.getTime() or similar
//TODO:	klass.coerceToTm = ...?
	klass.coerceToString = function coerceToString(value) {
		if (value === null) return "";
		switch (typeof(value)) {
		case "undefined":
			return "";
		case "number":
			return value.toString();
		case "string":
			return value;
		case "object":
			if (value instanceof Array) {
				Value.verifyArray(r);
				for (var i = 0, ll = l.length, rl = r.length, len = Math.min(ll, rl); i < len; i++) {
					if (i >= ll) {
						if (i >= rl) return 0; // arrays are same length
						return -1; // left array is shorter
					}
					if (i >= rl) return 1; // right array is shorter
					var cmp = Value.compare(l[i], r[i]);
					if (cmp !== 0) return cmp;
				}
				throw new Error("logic error in Value.compare for Array types!");
			} else if (value instanceof Date) { //TODO: Timestamp ??
				return value.toISOString();
			}
			/* falls through */
		default:
			throw new Error("can't convert from BSON type " + typeof(value) + " to String; code 16007");
		}
	};
//TODO:	klass.coerceToTimestamp = ...?

	klass.compare = function compare(l, r) {
		var lt = typeof(l),
			rt = typeof(r);
		// Special handling for Undefined and NULL values ...
		if (lt === "undefined") {
			if (rt === "undefined") return 0;
			return -1;
		}
		if (l === null) {
			if (rt === "undefined") return 1;
			if (r === null) return 0;
			return -1;
		}
		// We know the left value isn't Undefined, because of the above. Count a NULL value as greater than an undefined one.
		if (rt === "undefined" || r === null) return 1;
		// Numbers
		if (lt === "number" && rt === "number") return l < r ? -1 : l > r ? 1 : 0;
		// CW TODO for now, only compare like values
		if (lt !== rt) throw new Error("can't compare values of BSON types [" + lt + " " + l.constructor.name + "] and [" + rt + ":" + r.constructor.name + "]; code 16016");
		// Compare everything else
		switch (lt) {
		case "number":
			throw new Error("number types should have been handled earlier!");
		case "string":
			return l < r ? -1 : l > r ? 1 : 0;
		case "boolean":
			return l == r ? 0 : l ? 1 : -1;
		case "object":
			if (l instanceof Array) {
				for (var i = 0, ll = l.length, rl = r.length, len = Math.min(ll, rl); i < len; i++) {
					if (i >= ll) {
						if (i >= rl) return 0; // arrays are same length
						return -1; // left array is shorter
					}
					if (i >= rl) return 1; // right array is shorter
					var cmp = Value.compare(l[i], r[i]);
					if (cmp !== 0) return cmp;
				}
				throw new Error("logic error in Value.compare for Array types!");
			}
			if (l instanceof Date) return l < r ? -1 : l > r ? 1 : 0;
			if (l instanceof RegExp) return l < r ? -1 : l > r ? 1 : 0;
			return Document.compare(l, r);
		default:
			throw new Error("unhandled left hand type:" + lt);
		}

	};

	//Takes a "value" object and returns a hashcode
	klass.hashCombine = function hashCombine(val){
		/*
		SHA3.update(val)
		return SHA3.digest('hex');
		*/
		var sha3 = new SHA3.SHA3Hash(224);
		sha3.update(JSON.stringify(val));
		return sha3.digest('hex');
	};

//TODO:	klass.hashCombine = ...?
//TODO:	klass.getWidestNumeric = ...?
//TODO:	klass.getApproximateSize = ...?
//TODO:	klass.addRef = ...?
//TODO:	klass.release = ...?

	return klass;
})();
