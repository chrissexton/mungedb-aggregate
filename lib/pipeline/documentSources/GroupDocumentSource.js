"use strict";
var DocumentSource = require("./DocumentSource"),
	Accumulators = require("../accumulators/"),
	Document = require("../Document"),
	Expression = require("../expressions/Expression"),
	ConstantExpression = require("../expressions/ConstantExpression"),
	FieldPathExpression = require("../expressions/FieldPathExpression");


/**
 * A class for grouping documents together
 * @class GroupDocumentSource
 * @namespace mungedb-aggregate.pipeline.documentSources
 * @module mungedb-aggregate
 * @constructor
 * @param [ctx] {ExpressionContext}
 **/
var GroupDocumentSource = module.exports = function GroupDocumentSource(expCtx) {
	if (arguments.length > 1) throw new Error("up to one arg expected");
	base.call(this, expCtx);

	this.populated = false;
	this.idExpression = null;
	this.groups = {}; // GroupsType Value -> Accumulators[]
	this.groupsKeys = []; // This is to faciliate easier look up of groups

	this.fieldNames = [];
	this.accumulatorFactories = [];
	this.expressions = [];
	this.currentDocument = null;
	this.currentGroupsKeysIndex = 0;

}, klass = GroupDocumentSource, base = DocumentSource, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

klass.groupOps = {
	"$addToSet": Accumulators.AddToSet,
	"$avg": Accumulators.Avg,
	"$first": Accumulators.First,
	"$last": Accumulators.Last,
	"$max": Accumulators.MinMax.createMax,
	"$min": Accumulators.MinMax.createMin,
	"$push": Accumulators.Push,
	"$sum": Accumulators.Sum
};

klass.groupName = "$group";

proto.getSourceName = function getSourceName() {
	return klass.groupName;
};

/**
 * Create an object that represents the document source.  The object
 * will have a single field whose name is the source's name.  This
 * will be used by the default implementation of addToJsonArray()
 * to add this object to a pipeline being represented in JSON.
 *
 * @method	sourceToJson
 * @param	{Object} builder	JSONObjBuilder: a blank object builder to write to
 * @param	{Boolean}	explain	create explain output
 **/
proto.sourceToJson = function sourceToJson(builder, explain) {
	var idExp = this.idExpression,
		insides = {
			_id: idExp ? idExp.toJSON() : {}
		},
		aFac = this.accumulatorFactories,
		aFacLen = aFac.length;

	for(var i=0; i < aFacLen; ++i) {
		var acc = new aFac[i](/*pExpCtx*/);
		acc.addOperand(this.expressions[i]);

		insides[this.fieldNames[i]] = acc.toJSON(true);
	}

	builder[this.getSourceName()] = insides;
};

klass.createFromJson = function createFromJson(groupObj, ctx) {
	if (!(groupObj instanceof Object && groupObj.constructor === Object)) throw new Error("a group's fields must be specified in an object");

	var idSet = false,
		group = new GroupDocumentSource(ctx);

	for (var groupFieldName in groupObj) {
		if (groupObj.hasOwnProperty(groupFieldName)) {
			var groupField = groupObj[groupFieldName];

			if (groupFieldName === "_id") {

				if(idSet) throw new Error("15948 a group's _id may only be specified once");

				if (groupField instanceof Object && groupField.constructor === Object) {
					var objCtx = new Expression.ObjectCtx({isDocumentOk:true});
					group.idExpression = Expression.parseObject(groupField, objCtx);
					idSet = true;

				} else if (typeof groupField === "string") {
					if (groupField[0] !== "$") {
						group.idExpression = new ConstantExpression(groupField);
					} else {
						var pathString = Expression.removeFieldPrefix(groupField);
						group.idExpression = new FieldPathExpression(pathString);
					}
					idSet = true;

				} else {
					var typeStr = group._getTypeStr(groupField);
					switch (typeStr) {
						case "number":
						case "string":
						case "boolean":
						case "Object":
						case "object": // null returns "object" Xp
						case "Array":
							group.idExpression = new ConstantExpression(groupField);
							idSet = true;
							break;
						default:
							throw new Error("a group's _id may not include fields of type " + typeStr  + "");
					}
				}


			} else {
				if (groupFieldName.indexOf(".") !== -1) throw new Error("16414 the group aggregate field name '" + groupFieldName + "' cannot contain '.'");
				if (groupFieldName[0] === "$") throw new Error("15950 the group aggregate field name '" + groupFieldName + "' cannot be an operator name");
				if (group._getTypeStr(groupFieldName) === "Object") throw new Error("15951 the group aggregate field '" + groupFieldName + "' must be defined as an expression inside an object");

				var subFieldCount = 0;
				for (var subFieldName in groupField) {
					if (groupField.hasOwnProperty(subFieldName)) {
						var subField = groupField[subFieldName],
							op = klass.groupOps[subFieldName];
						if (!op) throw new Error("15952 unknown group operator '" + subFieldName + "'");

						var groupExpression,
							subFieldTypeStr = group._getTypeStr(subField);
						if (subFieldTypeStr === "Object") {
							var subFieldObjCtx = new Expression.ObjectCtx({isDocumentOk:true});
							groupExpression = Expression.parseObject(subField, subFieldObjCtx);
						} else if (subFieldTypeStr === "Array") {
							throw new Error("15953 aggregating group operators are unary (" + subFieldName + ")");
						} else {
							groupExpression = Expression.parseOperand(subField);
						}
						group.addAccumulator(groupFieldName,op, groupExpression);

						++subFieldCount;
					}
				}
				if (subFieldCount != 1) throw new Error("15954 the computed aggregate '" + groupFieldName + "' must specify exactly one operator");
			}
		}
	}

	if (!idSet) throw new Error("15955 a group specification must include an _id");

	return group;
};

proto._getTypeStr = function _getTypeStr(obj) {
	var typeofStr = typeof obj,
		typeStr = (typeofStr == "object" && obj !== null) ? obj.constructor.name : typeofStr;
	return typeStr;
};

proto.advance = function advance() {
	base.prototype.advance.call(this); // Check for interupts ????
	if(!this.populated) this.populate();

	//verify(this.currentGroupsKeysIndex < this.groupsKeys.length);

	++this.currentGroupsKeysIndex;
	if (this.currentGroupsKeysIndex === this.groupsKeys.length) {
		this.currentDocument = null;
		return false;
	}

	this.currentDocument = this.makeDocument(this.currentGroupsKeysIndex);
	return true;
};

proto.eof = function eof() {
	if (!this.populated) this.populate();
	return this.currentGroupsKeysIndex === this.groupsKeys.length;
};

proto.getCurrent = function getCurrent() {
	if (!this.populated) this.populate();
	return this.currentDocument;
};

proto.getDependencies = function getDependencies(deps) {
	var self = this;
	// add _id
	this.idExpression.addDependencies(deps);
	// add the rest
	this.fieldNames.forEach(function (field, i) {
		self.expressions[i].addDependencies(deps);
	});

	return DocumentSource.GetDepsReturn.EXHAUSTIVE;
};

proto.addAccumulator = function addAccumulator(fieldName, accumulatorFactory, expression) {
	this.fieldNames.push(fieldName);
	this.accumulatorFactories.push(accumulatorFactory);
	this.expressions.push(expression);
};

proto.populate = function populate() {
	for (var hasNext = !this.source.eof(); hasNext; hasNext = this.source.advance()) {
		var group,
			currentDocument = this.source.getCurrent(),
			_id = this.idExpression.evaluate(currentDocument);

		if (undefined === _id) _id = null;

		var idHash = JSON.stringify(_id); //TODO: USE A REAL HASH.  I didn't have time to take collision into account.

		if (idHash in this.groups) {
			group = this.groups[idHash];
		} else {
			this.groups[idHash] = group = [];
			this.groupsKeys[this.currentGroupsKeysIndex] = idHash;
			++this.currentGroupsKeysIndex;
			for (var ai = 0; ai < this.accumulatorFactories.length; ++ai) {
				var accumulator = new this.accumulatorFactories[ai]();
				accumulator.addOperand(this.expressions[ai]);
				group.push(accumulator);
			}
		}


		// tickle all the accumulators for the group we found
		for (var gi = 0; gi < group.length; ++gi) {
			group[gi].evaluate(currentDocument);
		}

	}

	this.currentGroupsKeysIndex = 0; // Start the group
	if (this.groupsKeys.length > 0) {
		this.currentDocument = this.makeDocument(this.currentGroupsKeysIndex);
	}
	this.populated = true;

};

proto.makeDocument = function makeDocument(groupKeyIndex) {
	var groupKey = this.groupsKeys[groupKeyIndex],
		group = this.groups[groupKey],
		doc = {};

	doc[Document.ID_PROPERTY_NAME] = JSON.parse(groupKey);

	for (var i = 0; i < this.fieldNames.length; ++i) {
		var fieldName = this.fieldNames[i],
			item = group[i];
		if (item !== "null" && item !== undefined) {
			doc[fieldName] = item.getValue();
		}
	}

	return doc;
};
