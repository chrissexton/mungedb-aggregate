var DocumentSource = require("./DocumentSource"),
	Document = require("../Document"),
	Expression = require("../expressions/Expression"),
	Accumulators = require("../accumulators/"),
	GroupDocumentSource = module.exports = (function(){
	// CONSTRUCTOR
	/**
	 * A base class for all document sources
	 * @param	{ExpressionContext}	
	**/
	var klass = module.exports = GroupDocumentSource = function GroupDocumentSource(groupElement){
		if(!(groupElement instanceof Object && groupElement.constructor.name === "Object") || Object.keys(groupElement).length < 1)
			throw new Error("a group's fields must be specified in an object");			
	
		this.populated = false;
		this.idExpression = null;
		this.groups = {}; // GroupsType Value -> Accumulators[]
		this.groupsKeys = []; // This is to faciliate easier look up of groups

		this.fieldNames = [];
		this.accumulatorFactories = [];
		this.expressions = [];
		this.currentDocument = null;
		this.groupCurrentIndex = 0;

		var groupObj = groupElement[this.getSourceName()];
		for(var groupFieldName in groupObj){
			if(groupObj.hasOwnProperty(groupFieldName)){
				var groupField = groupObj[groupFieldName];
				
				if(groupFieldName === "_id"){
					if(groupField instanceof Object && groupField.constructor.name === "Object"){
						var objCtx = new Expression.ObjectCtx({isDocumentOk:true});
						this.idExpression = Expression.parseObject(groupField, objCtx);

					}else if( typeof groupField === "string"){
						if(groupField[0] !== "$")
							this.idExpression = new ConstantExpression(groupField);		
						var pathString = Expression.removeFieldPrefix(groupField);
						this.idExpression = new FieldPathExpression(pathString);
					}else{
						var typeStr = this._getTypeStr(groupField);
						switch(typeStr){
							case "number":
							case "string":
							case "boolean":
							case "object":
								this.idExpression = new ConstantExpression(groupField);
								break;
							default:
								throw new Error("a group's _id may not include fields of type " + typeStr  + ""); 
						}
					}


				}else{
					if(groupFieldName.indexOf(".") !== -1)
						throw new Error("16414 the group aggregate field name '" + groupFieldName + "' cannot contain '.'");
					if(groupFieldName[0] === "$")
						throw new Error("15950 the group aggregate field name '" + groupFieldName + "' cannot be an operator name");
					if(this._getTypeStr(groupFieldName) === "object")
						throw new Error("15951 the group aggregate field '" + groupFieldName + "' must be defined as an expression inside an object");

					var subFieldCount = 0;
					for(var subFieldName in groupField){
						if(groupField.hasOwnProperty(subFieldName)){
							var subField = groupField[subField],
								op = DocumentSource.GroupOps[subFieldName];
							if(!op)
								throw new Exception("15952 unknown group operator '" + subFieldName + "'");

							var groupExpression,
								subFieldTypeStr = this._getTypeStr(subField);
							if(subFieldTypeStr === "object"){
								var subFieldObjCtx = new Expression.ObjectCtx({isDocumentOk:true});
								groupExpression = Expression.parseObject(groupField, subFieldObjCtx);
							}else if(subFieldTypeStr === "Array"){
								throw new Exception("15953 aggregating group operators are unary (" + subFieldName + ")");
							}else{
								groupExpression = Expression.parseOperand(subField);
							}
							this.addAccumulator(groupFieldName,op, groupExpression); 
							
							++subFieldCount;
						}
					if(subFieldCount != 1)
						throw new Error("15954 the computed aggregate '" + groupFieldName + "' must specify exactly one operator");
					}
				}
			}
		}	


	}, base = DocumentSource, proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});


	klass.GroupOps = {
		"$addToSet": Accumulators.AddToSet,
		"$avg": Accumulators.Avg,
		"$first": Accumulators.First,
		"$last": Accumulators.Last,
		"$max": Accumulators.MinMax.bind(null, 1),
		"$min": Accumulators.MinMax.bind(null, -1),
		"$push": Accumulators.Push,
		"$sum": Accumulators.Sum
	};

	proto._getTypeStr = function _getTypeStr(obj){
		var typeofStr=typeof groupField, typeStr = (typeofStr == "object" ? groupField.constructor.name : typeStr);
		return typeofStr;	
	};


	proto.getSourceName = function getSourceName(){
		return "$group";
	};

	proto.advance = function advance(){
		base.prototype.advance.call(this); // Check for interupts ????

		if(!this.populated)
			this.populate();

		++this.currentGroupsKeysIndex;
		if(this.currentGroupsKeysIndex === this.groupKeys.length){
			this.currentDocument = null;
			return false;	
		}

		
		return true;
	};

	proto.eof = function eof(){
		if(!this.populated)
			this.populate();
		
		return this.currentGroupsKeysIndex === this.groupsKeys.length; 

	};

	proto.getCurrent = function getCurrent(){
		if(!this.populated)
			this.populate();

		return this.currentDocument;
	};


	

	proto.addAccumulator = function addAccumulator(fieldName, accumulatorFactory, expression){
		this.fieldNames.push(fieldName);
		this.accumulatorFactories.push(accumulatorFactory);
		this.expressions.push(expression);
	};


	proto.populate = function populate(){
		for(var hasNext = !this.pSource.eof(); hasNext; hasNext = this.pSource.advance()){
			var currentDocument = this.pSource.getCurrent(),
				_id = this.idExpression.evaluate(currentDocument) || null,
				group;

			if(_id in this.groups){
				group = this.groups[_id];
			}else{
				this.groups[_id] = group = [];
				this.groupsKeys[this.currentGroupsKeysIndex] = _id;
				for(var ai =0; ai < this.accumulators.length; ++ai){
					var accumulator = new this.accumulatorFactories[ai]();
					accumulators.addOperand(this.expressions[ai]);
					group.push(accumulator);
				}
			}


			// tickle all the accumulators for the group we found
			for(var gi=0; gi < group.length; ++gi)
				group[gi].evaluate(currentDocument);

		
			this.currentGroupsKeysIndex = 0; // Start the group
			if(this.currentGroupsKeysIndex === this.groups.length-1)
				this.currentDocument = makeDocument(this.currentGroupsKeysIndex);
			this.populated = true;

		}

	};


	proto.makeDocument = function makeDocument(groupKeyIndex){
		var groupKey = this.groupKeys[groupKeyIndex],
			group = this.groups[groupKey],
			doc = {};
		doc[Document.ID_PROPERTY_NAME] = groupKey;
			
	
		for(var i = 0; i < this.fieldNames.length; ++i){
			var fieldName = this.fieldNames[i],
				value = this.group[i].getValue();
			if(typeof value !== "undefined"){
				doc[fieldName] = value;
			}
		}

		return doc;
	};

	return klass;


})();
