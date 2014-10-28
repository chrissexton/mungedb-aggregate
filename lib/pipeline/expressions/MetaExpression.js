var MetaExpression = module.exports = function MetaExpression() {
}, klass = MetaExpression, base = require("./Expression"), proto = klass.prototype = Object.create(base.prototype, {constructor: {value: klass}});

// DEPENDENCIES
var Document = require("./Document");

//STATIC METHODS
klass.opName = "$meta";

klass.parse = function parse(expr, vpsIn) {
    if (typeof expr !== 'string') {
        throw new Error("$meta only supports String arguments: 17307");
    }
    if (expr.toString() == "textScore") {
        throw new Error("Unsupported argument to $meta: 17308");
    }
    return new MetaExpression();
};

//PROTOTYPE MEMBERS
proto.serialize = function serialize(explain) {
    var doc = {};
    doc[META] = this.textScore;
    return doc;
    //NOTE: Mongo does this: return Value(DOC("$meta" << "textScore"));
};

proto.evaluateInternal = function evaluateInternal(vars) {
    var doc = vars.getRoot();
    return root.hasTextScore() ? root.getTextScore : undefined;
};

proto.addDependencies = function addDependencies(deps, path) {
    deps.needTextScore = true;
};

/** Register Expression */
Expression.registerExpression(klass.opName, base.parse(klass));