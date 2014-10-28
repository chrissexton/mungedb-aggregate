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

};

proto.evaluateInternal = function evaluateInternal(vars) {

};

proto.addDependencies = function addDependencies(deps, path) {

};

/** Register Expression */
Expression.registerExpression(klass.opName, base.parse(klass));

    Value ExpressionMeta::serialize(bool explain) const {
        return Value(DOC("$meta" << "textScore"));
    }

    Value ExpressionMeta::evaluateInternal(Variables* vars) const {
        const Document& root = vars->getRoot();
        return root.hasTextScore()
                ? Value(root.getTextScore())
                : Value();
    }

    void ExpressionMeta::addDependencies(DepsTracker* deps, vector<string>* path) const {
        deps->needTextScore = true;
    }
