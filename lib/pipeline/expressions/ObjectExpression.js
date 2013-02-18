var ObjectExpression = module.exports = (function(){
	// CONSTRUCTOR
	/** Create an empty expression.  Until fields are added, this will evaluate to an empty document (object). **/
	var klass = function ObjectExpression(){
		if(arguments.length !== 0) throw new Error("zero args expected");
		this._excludeId = false;	/// <Boolean> for if _id is to be excluded
		this._expressions = {};	/// <Object<Expression>> mapping from fieldname to Expression to generate the value NULL expression means include from source document
		this._order = []; /// <Array<String>> this is used to maintain order for generated fields not in the source document
	}, base = require("./Expression"), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});

	// DEPENDENCIES
	var Value = require("../Value");


	// INSTANCE VARIABLES
	/** <Boolean> for if _id is to be excluded **/
	proto._excludeId = undefined;

	/** <Object<Expression>> mapping from fieldname to Expression to generate the value NULL expression means include from source document **/
	proto._expressions = undefined;

	/** <Array<String>> this is used to maintain order for generated fields not in the source document **/
	proto._order = [];


	// PROTOTYPE MEMBERS

	/** evaluate(), but return a Document instead of a Value-wrapped Document.
	| @param pDocument the input Document
	| @returns the result document
	**/
	proto.evaluateDocument = function evaluateDocument(doc){
		throw new Error("FINISH evaluateDocument");	//TODO:...
		/*
		intrusive_ptr<Document> ExpressionObject::evaluateDocument(
			const intrusive_ptr<Document> &pDocument) const {
			// create and populate the result
			intrusive_ptr<Document> pResult(
				Document::create(getSizeHint()));

			addToDocument(pResult,
						Document::create(), // No inclusion field matching.
						pDocument);
			return pResult;
		}
		*/
	};

	proto.evaluate = function evaluate(doc){
		throw new Error("FINISH evaluate");	//TODO:...
		//return Value::createDocument(evaluateDocument(pDocument));
	};

	proto.optimize = function optimize(){
		for (var key in this._expressions) {
			var expr = this._expressions[key];
			if (expr !== undefined && expr !== null) this._expressions[key] = expr.optimize();
		}
		return this;
	};

	proto.getIsSimple = function getIsSimple(){
		for (var key in this._expressions) {
			var expr = this._expressions[key];
			if (expr !== undefined && expr !== null && !expr.getIsSimple()) return false;
		}
		return true;
	};

	proto.addDependencies = function addDependencies(deps, path){
		var pathStr;
		if (path instanceof Array) {
			if (path.length === 0) {
				// we are in the top level of a projection so _id is implicit
				if (!this._excludeId) deps.insert("_id");
			} else {
				pathStr = new FieldPath(path).getPath() + ".";
			}
		} else {
			if (this._excludeId) throw new Error("_excludeId is true!");
		}
		for (var key in this._expressions) {
			var expr = this._expressions[key];
			if (expr !== undefined && expr !== null){
				if (path instanceof Array) path.push(key);
				expr.addDependencies(deps, path);
				if (path instanceof Array) path.pop();
			}else{ // inclusion
				if(path === undefined || path === null) throw new Error("inclusion not supported in objects nested in $expressions; code 16407");
				deps.insert(pathStr + key);
			}
		}
		return deps;
	};

	/** evaluate(), but add the evaluated fields to a given document instead of creating a new one.
	| @param pResult the Document to add the evaluated expressions to
	| @param pDocument the input Document for this level
	| @param rootDoc the root of the whole input document
	**/
	proto.addToDocument = function addToDocument(result, document, rootDoc){
		throw new Error("FINISH addToDocument");	//TODO:...
/*
	void ExpressionObject::addToDocument(
		const intrusive_ptr<Document> &pResult,
		const intrusive_ptr<Document> &pDocument,
		const intrusive_ptr<Document> &rootDoc
		) const
	{
		const bool atRoot = (pDocument == rootDoc);

		ExpressionMap::const_iterator end = _expressions.end();

		// This is used to mark fields we've done so that we can add the ones we haven't
		set<string> doneFields;

		FieldIterator fields(pDocument);
		while(fields.more()) {
			Document::FieldPair field (fields.next());

			ExpressionMap::const_iterator exprIter = _expressions.find(field.first);

			// This field is not supposed to be in the output (unless it is _id)
			if (exprIter == end) {
				if (!_excludeId && atRoot && field.first == Document::idName) {
					// _id from the root doc is always included (until exclusion is supported)
					// not updating doneFields since "_id" isn't in _expressions
					pResult->addField(field.first, field.second);
				}
				continue;
			}

			// make sure we don't add this field again
			doneFields.insert(exprIter->first);

			Expression* expr = exprIter->second.get();

			if (!expr) {
				// This means pull the matching field from the input document
				pResult->addField(field.first, field.second);
				continue;
			}

			ExpressionObject* exprObj = dynamic_cast<ExpressionObject*>(expr);
			BSONType valueType = field.second->getType();
			if ((valueType != Object && valueType != Array) || !exprObj ) {
				// This expression replace the whole field

				intrusive_ptr<const Value> pValue(expr->evaluate(rootDoc));

				// don't add field if nothing was found in the subobject
				if (exprObj && pValue->getDocument()->getFieldCount() == 0)
					continue;

				// Don't add non-existent values (note:  different from NULL); this is consistent with existing selection syntax which doesn't force the appearnance of non-existent fields.
				// TODO make missing distinct from Undefined
				if (pValue->getType() != Undefined)
					pResult->addField(field.first, pValue);


				continue;
			}
			// Check on the type of the input value.  If it's an object, just walk down into that recursively, and add it to the result.
			if (valueType == Object) {
				intrusive_ptr<Document> doc = Document::create(exprObj->getSizeHint());
				exprObj->addToDocument(doc,
									field.second->getDocument(),
									rootDoc);
				pResult->addField(field.first, Value::createDocument(doc));
			}
			else if (valueType == Array) {
				// If it's an array, we have to do the same thing, but to each array element.  Then, add the array of results to the current document.
				vector<intrusive_ptr<const Value> > result;
				intrusive_ptr<ValueIterator> pVI(field.second->getArray());
				while(pVI->more()) {
					intrusive_ptr<const Value> next =  pVI->next();

					// can't look for a subfield in a non-object value.
					if (next->getType() != Object)
						continue;

					intrusive_ptr<Document> doc = Document::create(exprObj->getSizeHint());
					exprObj->addToDocument(doc,
										next->getDocument(),
										rootDoc);
					result.push_back(Value::createDocument(doc));
				}

				pResult->addField(field.first,
									Value::createArray(result));
			}
			else {
				verify( false );
			}
		}
		if (doneFields.size() == _expressions.size())
			return;

		// add any remaining fields we haven't already taken care of
		for (vector<string>::const_iterator i(_order.begin()); i!=_order.end(); ++i) {
			ExpressionMap::const_iterator it = _expressions.find(*i);
			string fieldName(it->first);

			// if we've already dealt with this field, above, do nothing
			if (doneFields.count(fieldName))
				continue;

			// this is a missing inclusion field
			if (!it->second)
				continue;

			intrusive_ptr<const Value> pValue(it->second->evaluate(rootDoc));

			// Don't add non-existent values (note:  different from NULL); this is consistent with existing selection syntax which doesn't force the appearnance of non-existent fields.
			if (pValue->getType() == Undefined)
				continue;

			// don't add field if nothing was found in the subobject
			if (dynamic_cast<ExpressionObject*>(it->second.get())
					&& pValue->getDocument()->getFieldCount() == 0)
				continue;


			pResult->addField(fieldName, pValue);
		}
	}
*/
	};

	/** estimated number of fields that will be output **/
	proto.getSizeHint = function getSizeHint(){
		throw new Error("FINISH getSizeHint");	//TODO:...
		/*
		// Note: this can overestimate, but that is better than underestimating
		return _expressions.size() + (_excludeId ? 0 : 1);
		*/
	};

	/** Add a field to the document expression.
	| @param fieldPath the path the evaluated expression will have in the result Document
	| @param pExpression the expression to evaluate obtain this field's Value in the result Document
	**/
	proto.addField = function addField(path, pExpression){
		var fieldPart = path.fields[0],
			haveExpr = this._expressions.hasOwnProperty(fieldPart),
			expr = this._expressions[fieldPart];
var subObj = expr instanceof ObjectExpression ? expr : undefined;

		if(!haveExpr){
			this._order.push(fieldPart);
		}

		throw new Error("FINISH addField");	//TODO:...
		/*
		void ExpressionObject::addField(const FieldPath &fieldPath, const intrusive_ptr<Expression> &pExpression) {
			const string fieldPart = fieldPath.getFieldName(0);
			const bool haveExpr = _expressions.count(fieldPart);

			intrusive_ptr<Expression>& expr = _expressions[fieldPart]; // inserts if !haveExpr
			intrusive_ptr<ExpressionObject> subObj = dynamic_cast<ExpressionObject*>(expr.get());

			if (!haveExpr) {
				_order.push_back(fieldPart);
			}
			else { // we already have an expression or inclusion for this field
				if (fieldPath.getPathLength() == 1) {
					// This expression is for right here

					ExpressionObject* newSubObj = dynamic_cast<ExpressionObject*>(pExpression.get());
					uassert(16400, str::stream()
									<< "can't add an expression for field " << fieldPart
									<< " because there is already an expression for that field"
									<< " or one of its sub-fields.",
							subObj && newSubObj); // we can merge them

					// Copy everything from the newSubObj to the existing subObj
					// This is for cases like { $project:{ 'b.c':1, b:{ a:1 } } }
					for (vector<string>::const_iterator it (newSubObj->_order.begin());
														it != newSubObj->_order.end();
														++it) {
						// asserts if any fields are dupes
						subObj->addField(*it, newSubObj->_expressions[*it]);
					}
					return;
				}
				else {
					// This expression is for a subfield
					uassert(16401, str::stream()
							<< "can't add an expression for a subfield of " << fieldPart
							<< " because there is already an expression that applies to"
							<< " the whole field",
							subObj);
				}
			}

			if (fieldPath.getPathLength() == 1) {
				verify(!haveExpr); // haveExpr case handled above.
				expr = pExpression;
				return;
			}

			if (!haveExpr)
				expr = subObj = ExpressionObject::create();

			subObj->addField(fieldPath.tail(), pExpression);
		}
		*/
	};

	/** Add a field path to the set of those to be included.
	| Note that including a nested field implies including everything on the path leading down to it.
	| @param fieldPath the name of the field to be included
	**/
	proto.includePath = function includePath(path){
		this.addField(path);
	};

	/** Get a count of the added fields.
	| @returns how many fields have been added
	**/
	proto.getFieldCount = function getFieldCount(){
		var e; console.warn(e=new Error("CALLER SHOULD BE USING #expressions.length instead!")); console.log(e.stack);
		return this._expressions.length;
	};

/*TODO: ... remove this?
	inline ExpressionObject::BuilderPathSink::BuilderPathSink(
		BSONObjBuilder *pB):
		pBuilder(pB) {
	}
*/

/*TODO: ... remove this?
	inline ExpressionObject::PathPusher::PathPusher(
		vector<string> *pTheVPath, const string &s):
		pvPath(pTheVPath) {
		pvPath->push_back(s);
	}

	inline ExpressionObject::PathPusher::~PathPusher() {
		pvPath->pop_back();
	}
*/

/** Specialized BSON conversion that allows for writing out a $project specification.
| This creates a standalone object, which must be added to a containing object with a name
| @param pBuilder where to write the object to
| @param requireExpression see Expression::addToBsonObj
**/
//TODO:	proto.documentToBson = ...?
//TODO:	proto.addToBsonObj = ...?
//TODO: proto.addToBsonArray = ...?

/*
/// Visitor abstraction used by emitPaths().  Each path is recorded by calling path().
		class PathSink {
		public:
			virtual ~PathSink() {};
			/// Record a path.
			/// @param path the dotted path string
			/// @param include if true, the path is included; if false, the path is excluded
			virtual void path(const string &path, bool include) = 0;
		};

/// Utility object for collecting emitPaths() results in a BSON object.
		class BuilderPathSink :
			public PathSink {
		public:
			// virtuals from PathSink
			virtual void path(const string &path, bool include);

/// Create a PathSink that writes paths to a BSONObjBuilder, to create an object in the form of { path:is_included,...}
/// This object uses a builder pointer that won't guarantee the lifetime of the builder, so make sure it outlasts the use of this for an emitPaths() call.
/// @param pBuilder to the builder to write paths to
			BuilderPathSink(BSONObjBuilder *pBuilder);

		private:
			BSONObjBuilder *pBuilder;
		};

/// utility class used by emitPaths()
		class PathPusher :
			boost::noncopyable {
		public:
			PathPusher(vector<string> *pvPath, const string &s);
			~PathPusher();

		private:
			vector<string> *pvPath;
		};
*/

//void excludeId(bool b) { _excludeId = b; }

	return klass;
})();
