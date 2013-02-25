
/** Empty object spec. */
class Empty : public ExpectedResultBase {
public:
	void prepareExpression() {}
	BSONObj expected() { return BSON( "_id" << 0 ); }
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" ); }
	BSONObj expectedBsonRepresentation() { return BSONObj(); }
};

/** Include 'a' field only. */
class Include : public ExpectedResultBase {
public:
	void prepareExpression() { expression()->includePath( "a" ); }
	BSONObj expected() { return BSON( "_id" << 0 << "a" << 1 ); }
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" << "a" ); }
	BSONObj expectedBsonRepresentation() {
		return BSON( "a" << true );
	}
};

/** Cannot include missing 'a' field. */
class MissingInclude : public ExpectedResultBase {
public:
	virtual BSONObj source() { return BSON( "_id" << 0 << "b" << 2 ); }
	void prepareExpression() { expression()->includePath( "a" ); }
	BSONObj expected() { return BSON( "_id" << 0 ); }
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" << "a" ); }
	BSONObj expectedBsonRepresentation() {
		return BSON( "a" << true );
	}
};

/** Include '_id' field only. */
class IncludeId : public ExpectedResultBase {
public:
	void prepareExpression() { expression()->includePath( "_id" ); }
	BSONObj expected() { return BSON( "_id" << 0 ); }            
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" ); }
	BSONObj expectedBsonRepresentation() {
		return BSON( "_id" << true );
	}
};

/** Exclude '_id' field. */
class ExcludeId : public ExpectedResultBase {
public:
	void prepareExpression() {
		expression()->includePath( "b" );
		expression()->excludeId( true );
	}
	BSONObj expected() { return BSON( "b" << 2 ); }
	BSONArray expectedDependencies() { return BSON_ARRAY( "b" ); }
	BSONObj expectedBsonRepresentation() {
		return BSON( "_id" << false << "b" << true );
	}
};

/** Result order based on source document field order, not inclusion spec field order. */
class SourceOrder : public ExpectedResultBase {
public:
	void prepareExpression() {
		expression()->includePath( "b" );
		expression()->includePath( "a" );
	}
	BSONObj expected() { return source(); }            
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" << "a" << "b" ); }
	BSONObj expectedBsonRepresentation() {
		return BSON( "b" << true << "a" << true );
	}
};

/** Include a nested field. */
class IncludeNested : public ExpectedResultBase {
public:
	void prepareExpression() { expression()->includePath( "a.b" ); }
	BSONObj expected() { return BSON( "_id" << 0 << "a" << BSON( "b" << 5 ) ); }
	BSONObj source() {
		return BSON( "_id" << 0 << "a" << BSON( "b" << 5 << "c" << 6 ) << "z" << 2 );
	}
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" << "a.b" ); }
	BSONObj expectedBsonRepresentation() {
		return BSON( "a" << BSON( "b" << true ) );
	}
};

/** Include two nested fields. */
class IncludeTwoNested : public ExpectedResultBase {
public:
	void prepareExpression() {
		expression()->includePath( "a.b" );
		expression()->includePath( "a.c" );
	}
	BSONObj expected() { return BSON( "_id" << 0 << "a" << BSON( "b" << 5 << "c" << 6 ) ); }
	BSONObj source() {
		return BSON( "_id" << 0 << "a" << BSON( "b" << 5 << "c" << 6 ) << "z" << 2 );
	}
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" << "a.b" << "a.c" ); }
	BSONObj expectedBsonRepresentation() {
		return BSON( "a" << BSON( "b" << true << "c" << true ) );
	}
};

/** Include two fields nested within different parents. */
class IncludeTwoParentNested : public ExpectedResultBase {
public:
	void prepareExpression() {
		expression()->includePath( "a.b" );
		expression()->includePath( "c.d" );
	}
	BSONObj expected() {
		return BSON( "_id" << 0 << "a" << BSON( "b" << 5 ) << "c" << BSON( "d" << 6 ) );
	}
	BSONObj source() {
		return BSON( "_id" << 0 << "a" << BSON( "b" << 5 )
					 << "c" << BSON( "d" << 6 ) << "z" << 2 );
	}
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" << "a.b" << "c.d" ); }
	BSONObj expectedBsonRepresentation() {
		return BSON( "a" << BSON( "b" << true ) << "c" << BSON( "d" << true ) );
	}
};

/** Attempt to include a missing nested field. */
class IncludeMissingNested : public ExpectedResultBase {
public:
	void prepareExpression() { expression()->includePath( "a.b" ); }
	BSONObj expected() { return BSON( "_id" << 0 << "a" << BSONObj() ); }
	BSONObj source() {
		return BSON( "_id" << 0 << "a" << BSON( "c" << 6 ) << "z" << 2 );
	}
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" << "a.b" ); }
	BSONObj expectedBsonRepresentation() {
		return BSON( "a" << BSON( "b" << true ) );
	}
};

/** Attempt to include a nested field within a non object. */
class IncludeNestedWithinNonObject : public ExpectedResultBase {
public:
	void prepareExpression() { expression()->includePath( "a.b" ); }
	BSONObj expected() { return BSON( "_id" << 0 ); }
	BSONObj source() {
		return BSON( "_id" << 0 << "a" << 2 << "z" << 2 );
	}
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" << "a.b" ); }
	BSONObj expectedBsonRepresentation() {
		return BSON( "a" << BSON( "b" << true ) );
	}
};

/** Include a nested field within an array. */
class IncludeArrayNested : public ExpectedResultBase {
public:
	void prepareExpression() { expression()->includePath( "a.b" ); }
	BSONObj expected() { return fromjson( "{_id:0,a:[{b:5},{b:2},{}]}" ); }
	BSONObj source() {
		return fromjson( "{_id:0,a:[{b:5,c:6},{b:2,c:9},{c:7},[],2],z:1}" );
	}
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" << "a.b" ); }
	BSONObj expectedBsonRepresentation() {
		return BSON( "a" << BSON( "b" << true ) );
	}
};

/** Don't include not root '_id' field implicitly. */
class ExcludeNonRootId : public ExpectedResultBase {
public:
	virtual BSONObj source() {
		return BSON( "_id" << 0 << "a" << BSON( "_id" << 1 << "b" << 1 ) );
	}
	void prepareExpression() { expression()->includePath( "a.b" ); }
	BSONObj expected() { return BSON( "_id" << 0 << "a" << BSON( "b" << 1 ) ); }
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" << "a.b" ); }
	BSONObj expectedBsonRepresentation() {
		return BSON( "a" << BSON( "b" << true ) );
	}
};

/** Project a computed expression. */
class Computed : public ExpectedResultBase {
public:
	virtual BSONObj source() {
		return BSON( "_id" << 0 );
	}
	void prepareExpression() {
		expression()->addField( mongo::FieldPath( "a" ),
								ExpressionConstant::create( Value::createInt( 5 ) ) );
	}
	BSONObj expected() { return BSON( "_id" << 0 << "a" << 5 ); }
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" ); }
	BSONObj expectedBsonRepresentation() {
		return BSON( "a" << BSON( "$const" << 5 ) );
	}
	bool expectedIsSimple() { return false; }
};

/** Project a computed expression replacing an existing field. */
class ComputedReplacement : public Computed {
	virtual BSONObj source() {
		return BSON( "_id" << 0 << "a" << 99 );
	}
};

/** An undefined value is not projected.. */
class ComputedUndefined : public ExpectedResultBase {
public:
	virtual BSONObj source() {
		return BSON( "_id" << 0 );
	}
	void prepareExpression() {
		expression()->addField( mongo::FieldPath( "a" ),
								ExpressionConstant::create( Value::getUndefined() ) );
	}
	BSONObj expected() { return BSON( "_id" << 0 ); }
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" ); }
	BSONObj expectedBsonRepresentation() {
		return fromjson( "{a:{$const:undefined}}" );
	}
	bool expectedIsSimple() { return false; }
};

/** Project a computed expression replacing an existing field with Undefined. */
class ComputedUndefinedReplacement : public ComputedUndefined {
	virtual BSONObj source() {
		return BSON( "_id" << 0 << "a" << 99 );
	}
};

/** A null value is projected. */
class ComputedNull : public ExpectedResultBase {
public:
	virtual BSONObj source() {
		return BSON( "_id" << 0 );
	}
	void prepareExpression() {
		expression()->addField( mongo::FieldPath( "a" ),
								ExpressionConstant::create( Value::getNull() ) );
	}
	BSONObj expected() { return BSON( "_id" << 0 << "a" << BSONNULL ); }
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" ); }
	BSONObj expectedBsonRepresentation() {
		return BSON( "a" << BSON( "$const" << BSONNULL ) );
	}
	bool expectedIsSimple() { return false; }
};

/** A nested value is projected. */
class ComputedNested : public ExpectedResultBase {
public:
	virtual BSONObj source() { return BSON( "_id" << 0 ); }
	void prepareExpression() {
		expression()->addField( mongo::FieldPath( "a.b" ),
								ExpressionConstant::create( Value::createInt( 5 ) ) );
	}
	BSONObj expected() { return BSON( "_id" << 0 << "a" << BSON( "b" << 5 ) ); }
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" ); }
	BSONObj expectedBsonRepresentation() {
		return BSON( "a" << BSON( "b" << BSON( "$const" << 5 ) ) );
	}
	bool expectedIsSimple() { return false; }
};

/** A field path is projected. */
class ComputedFieldPath : public ExpectedResultBase {
public:
	virtual BSONObj source() { return BSON( "_id" << 0 << "x" << 4 ); }
	void prepareExpression() {
		expression()->addField( mongo::FieldPath( "a" ),
								ExpressionFieldPath::create( "x" ) );
	}
	BSONObj expected() { return BSON( "_id" << 0 << "a" << 4 ); }
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" << "x" ); }
	BSONObj expectedBsonRepresentation() { return BSON( "a" << "$x" ); }
	bool expectedIsSimple() { return false; }
};

/** A nested field path is projected. */
class ComputedNestedFieldPath : public ExpectedResultBase {
public:
	virtual BSONObj source() { return BSON( "_id" << 0 << "x" << BSON( "y" << 4 ) ); }
	void prepareExpression() {
		expression()->addField( mongo::FieldPath( "a.b" ),
								ExpressionFieldPath::create( "x.y" ) );
	}
	BSONObj expected() { return BSON( "_id" << 0 << "a" << BSON( "b" << 4 ) ); }
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" << "x.y" ); }
	BSONObj expectedBsonRepresentation() { return BSON( "a" << BSON( "b" << "$x.y" ) ); }
	bool expectedIsSimple() { return false; }
};

/** An empty subobject expression for a missing field is not projected. */
class EmptyNewSubobject : public ExpectedResultBase {
public:
	virtual BSONObj source() {
		return BSON( "_id" << 0 );
	}
	void prepareExpression() {
		// Create a sub expression returning an empty object.
		intrusive_ptr<ExpressionObject> subExpression = ExpressionObject::create();
		subExpression->addField( mongo::FieldPath( "b" ),
								 ExpressionConstant::create( Value::getUndefined() ) );
		expression()->addField( mongo::FieldPath( "a" ), subExpression );
	}
	BSONObj expected() { return BSON( "_id" << 0 ); }
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" ); }
	BSONObj expectedBsonRepresentation() {
		return fromjson( "{a:{b:{$const:undefined}}}" );
	}
	bool expectedIsSimple() { return false; }
};

/** A non empty subobject expression for a missing field is projected. */
class NonEmptyNewSubobject : public ExpectedResultBase {
public:
	virtual BSONObj source() {
		return BSON( "_id" << 0 );
	}
	void prepareExpression() {
		// Create a sub expression returning an empty object.
		intrusive_ptr<ExpressionObject> subExpression = ExpressionObject::create();
		subExpression->addField( mongo::FieldPath( "b" ),
								 ExpressionConstant::create( Value::createInt( 6 ) ) );
		expression()->addField( mongo::FieldPath( "a" ), subExpression );
	}
	BSONObj expected() { return BSON( "_id" << 0 << "a" << BSON( "b" << 6 ) ); }
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" ); }
	BSONObj expectedBsonRepresentation() {
		return fromjson( "{a:{b:{$const:6}}}" );
	}
	bool expectedIsSimple() { return false; }
};

/** Two computed fields within a common parent. */
class AdjacentDottedComputedFields : public ExpectedResultBase {
public:
	virtual BSONObj source() {
		return BSON( "_id" << 0 );
	}
	void prepareExpression() {
		expression()->addField( mongo::FieldPath( "a.b" ),
								ExpressionConstant::create( Value::createInt( 6 ) ) );
		expression()->addField( mongo::FieldPath( "a.c" ),
								ExpressionConstant::create( Value::createInt( 7 ) ) );
	}
	BSONObj expected() { return BSON( "_id" << 0 << "a" << BSON( "b" << 6 << "c" << 7 ) ); }
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" ); }
	BSONObj expectedBsonRepresentation() {
		return fromjson( "{a:{b:{$const:6},c:{$const:7}}}" );
	}
	bool expectedIsSimple() { return false; }
};

/** Two computed fields within a common parent, in one case dotted. */
class AdjacentDottedAndNestedComputedFields : public AdjacentDottedComputedFields {
	void prepareExpression() {
		expression()->addField( mongo::FieldPath( "a.b" ),
								ExpressionConstant::create( Value::createInt( 6 ) ) );
		intrusive_ptr<ExpressionObject> subExpression = ExpressionObject::create();
		subExpression->addField( mongo::FieldPath( "c" ),
								 ExpressionConstant::create( Value::createInt( 7 ) ) );
		expression()->addField( mongo::FieldPath( "a" ), subExpression );
	}
};

/** Two computed fields within a common parent, in another case dotted. */
class AdjacentNestedAndDottedComputedFields : public AdjacentDottedComputedFields {
	void prepareExpression() {
		intrusive_ptr<ExpressionObject> subExpression = ExpressionObject::create();
		subExpression->addField( mongo::FieldPath( "b" ),
								 ExpressionConstant::create( Value::createInt( 6 ) ) );
		expression()->addField( mongo::FieldPath( "a" ), subExpression );
		expression()->addField( mongo::FieldPath( "a.c" ),
								ExpressionConstant::create( Value::createInt( 7 ) ) );
	}
};

/** Two computed fields within a common parent, nested rather than dotted. */
class AdjacentNestedComputedFields : public AdjacentDottedComputedFields {
	void prepareExpression() {
		intrusive_ptr<ExpressionObject> firstSubExpression = ExpressionObject::create();
		firstSubExpression->addField( mongo::FieldPath( "b" ),
									  ExpressionConstant::create( Value::createInt( 6 ) ) );
		expression()->addField( mongo::FieldPath( "a" ), firstSubExpression );
		intrusive_ptr<ExpressionObject> secondSubExpression = ExpressionObject::create();
		secondSubExpression->addField( mongo::FieldPath( "c" ),
									   ExpressionConstant::create
										( Value::createInt( 7 ) ) );
		expression()->addField( mongo::FieldPath( "a" ), secondSubExpression );
	}            
};

/** Field ordering is preserved when nested fields are merged. */
class AdjacentNestedOrdering : public ExpectedResultBase {
public:
	virtual BSONObj source() {
		return BSON( "_id" << 0 );
	}
	void prepareExpression() {
		expression()->addField( mongo::FieldPath( "a.b" ),
								ExpressionConstant::create( Value::createInt( 6 ) ) );
		intrusive_ptr<ExpressionObject> subExpression = ExpressionObject::create();
		// Add field 'd' then 'c'.  Expect the same field ordering in the result doc.
		subExpression->addField( mongo::FieldPath( "d" ),
								 ExpressionConstant::create( Value::createInt( 7 ) ) );
		subExpression->addField( mongo::FieldPath( "c" ),
								 ExpressionConstant::create( Value::createInt( 8 ) ) );
		expression()->addField( mongo::FieldPath( "a" ), subExpression );
	}
	BSONObj expected() {
		return BSON( "_id" << 0 << "a" << BSON( "b" << 6 << "d" << 7 << "c" << 8 ) );
	}
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" ); }
	BSONObj expectedBsonRepresentation() {
		return fromjson( "{a:{b:{$const:6},d:{$const:7},c:{$const:8}}}" );
	}
	bool expectedIsSimple() { return false; }
};

/** Adjacent fields two levels deep. */
class MultipleNestedFields : public ExpectedResultBase {
public:
	virtual BSONObj source() {
		return BSON( "_id" << 0 );
	}
	void prepareExpression() {
		expression()->addField( mongo::FieldPath( "a.b.c" ),
								ExpressionConstant::create( Value::createInt( 6 ) ) );
		intrusive_ptr<ExpressionObject> bSubExpression = ExpressionObject::create();
		bSubExpression->addField( mongo::FieldPath( "d" ),
								  ExpressionConstant::create( Value::createInt( 7 ) ) );
		intrusive_ptr<ExpressionObject> aSubExpression = ExpressionObject::create();
		aSubExpression->addField( mongo::FieldPath( "b" ), bSubExpression );
		expression()->addField( mongo::FieldPath( "a" ), aSubExpression );
	}
	BSONObj expected() {
		return BSON( "_id" << 0 << "a" << BSON( "b" << BSON( "c" << 6 << "d" << 7 ) ) );
	}
	BSONArray expectedDependencies() { return BSON_ARRAY( "_id" ); }
	BSONObj expectedBsonRepresentation() {
		return fromjson( "{a:{b:{c:{$const:6},d:{$const:7}}}}" );
	}
	bool expectedIsSimple() { return false; }
};

/** Two expressions cannot generate the same field. */
class ConflictingExpressionFields : public Base {
public:
	void run() {
		intrusive_ptr<ExpressionObject> expression = ExpressionObject::create();
		expression->addField( mongo::FieldPath( "a" ),
							  ExpressionConstant::create( Value::createInt( 5 ) ) );
		ASSERT_THROWS( expression->addField( mongo::FieldPath( "a" ), // Duplicate field.
											 ExpressionConstant::create
											  ( Value::createInt( 6 ) ) ),
					   UserException );
	}
};        

/** An expression field conflicts with an inclusion field. */
class ConflictingInclusionExpressionFields : public Base {
public:
	void run() {
		intrusive_ptr<ExpressionObject> expression = ExpressionObject::create();
		expression->includePath( "a" );
		ASSERT_THROWS( expression->addField( mongo::FieldPath( "a" ),
											 ExpressionConstant::create
											  ( Value::createInt( 6 ) ) ),
					   UserException );
	}
};        

/** An inclusion field conflicts with an expression field. */
class ConflictingExpressionInclusionFields : public Base {
public:
	void run() {
		intrusive_ptr<ExpressionObject> expression = ExpressionObject::create();
		expression->addField( mongo::FieldPath( "a" ),
							  ExpressionConstant::create( Value::createInt( 5 ) ) );
		ASSERT_THROWS( expression->includePath( "a" ),
					   UserException );
	}
};        

/** An object expression conflicts with a constant expression. */
class ConflictingObjectConstantExpressionFields : public Base {
public:
	void run() {
		intrusive_ptr<ExpressionObject> expression = ExpressionObject::create();
		intrusive_ptr<ExpressionObject> subExpression = ExpressionObject::create();
		subExpression->includePath( "b" );
		expression->addField( mongo::FieldPath( "a" ), subExpression );
		ASSERT_THROWS( expression->addField( mongo::FieldPath( "a.b" ),
											 ExpressionConstant::create
											  ( Value::createInt( 6 ) ) ),
					   UserException );
	}
};        

/** A constant expression conflicts with an object expression. */
class ConflictingConstantObjectExpressionFields : public Base {
public:
	void run() {
		intrusive_ptr<ExpressionObject> expression = ExpressionObject::create();
		expression->addField( mongo::FieldPath( "a.b" ),
							  ExpressionConstant::create( Value::createInt( 6 ) ) );
		intrusive_ptr<ExpressionObject> subExpression = ExpressionObject::create();
		subExpression->includePath( "b" );
		ASSERT_THROWS( expression->addField( mongo::FieldPath( "a" ), subExpression ),
					   UserException );
	}
};        

/** Two nested expressions cannot generate the same field. */
class ConflictingNestedFields : public Base {
public:
	void run() {
		intrusive_ptr<ExpressionObject> expression = ExpressionObject::create();
		expression->addField( mongo::FieldPath( "a.b" ),
							  ExpressionConstant::create( Value::createInt( 5 ) ) );
		ASSERT_THROWS( expression->addField( mongo::FieldPath( "a.b" ), // Duplicate field.
											 ExpressionConstant::create
											  ( Value::createInt( 6 ) ) ),
					   UserException );
	}
};        

/** An expression cannot be created for a subfield of another expression. */
class ConflictingFieldAndSubfield : public Base {
public:
	void run() {
		intrusive_ptr<ExpressionObject> expression = ExpressionObject::create();
		expression->addField( mongo::FieldPath( "a" ),
							  ExpressionConstant::create( Value::createInt( 5 ) ) );
		ASSERT_THROWS( expression->addField( mongo::FieldPath( "a.b" ),
											 ExpressionConstant::create
											  ( Value::createInt( 5 ) ) ),
					   UserException );
	}
};

/** An expression cannot be created for a nested field of another expression. */
class ConflictingFieldAndNestedField : public Base {
public:
	void run() {
		intrusive_ptr<ExpressionObject> expression = ExpressionObject::create();
		expression->addField( mongo::FieldPath( "a" ),
							  ExpressionConstant::create( Value::createInt( 5 ) ) );
		intrusive_ptr<ExpressionObject> subExpression = ExpressionObject::create();
		subExpression->addField( mongo::FieldPath( "b" ),
								 ExpressionConstant::create( Value::createInt( 5 ) ) );
		ASSERT_THROWS( expression->addField( mongo::FieldPath( "a" ), subExpression ),
					   UserException );
	}
};

/** An expression cannot be created for a parent field of another expression. */
class ConflictingSubfieldAndField : public Base {
public:
	void run() {
		intrusive_ptr<ExpressionObject> expression = ExpressionObject::create();
		expression->addField( mongo::FieldPath( "a.b" ),
							  ExpressionConstant::create( Value::createInt( 5 ) ) );
		ASSERT_THROWS( expression->addField( mongo::FieldPath( "a" ),
											 ExpressionConstant::create
											  ( Value::createInt( 5 ) ) ),
					   UserException );
	}
};

/** An expression cannot be created for a parent of a nested field. */
class ConflictingNestedFieldAndField : public Base {
public:
	void run() {
		intrusive_ptr<ExpressionObject> expression = ExpressionObject::create();
		intrusive_ptr<ExpressionObject> subExpression = ExpressionObject::create();
		subExpression->addField( mongo::FieldPath( "b" ),
								 ExpressionConstant::create( Value::createInt( 5 ) ) );
		expression->addField( mongo::FieldPath( "a" ), subExpression );
		ASSERT_THROWS( expression->addField( mongo::FieldPath( "a" ),
											 ExpressionConstant::create
											  ( Value::createInt( 5 ) ) ),
					   UserException );
	}
};

/** Dependencies for non inclusion expressions. */
class NonInclusionDependencies : public Base {
public:
	void run() {
		intrusive_ptr<ExpressionObject> expression = ExpressionObject::create();
		expression->addField( mongo::FieldPath( "a" ),
							  ExpressionConstant::create( Value::createInt( 5 ) ) );
		assertDependencies( BSON_ARRAY( "_id" ), expression, true );
		assertDependencies( BSONArray(), expression, false );
		expression->addField( mongo::FieldPath( "b" ),
							  ExpressionFieldPath::create( "c.d" ) );
		assertDependencies( BSON_ARRAY( "_id" << "c.d" ), expression, true );
		assertDependencies( BSON_ARRAY( "c.d" ), expression, false );
	}
};

/** Dependencies for inclusion expressions. */
class InclusionDependencies : public Base {
public:
	void run() {
		intrusive_ptr<ExpressionObject> expression = ExpressionObject::create();
		expression->includePath( "a" );
		assertDependencies( BSON_ARRAY( "_id" << "a" ), expression, true );
		set<string> unused;
		// 'path' must be provided for inclusion expressions.
		ASSERT_THROWS( expression->addDependencies( unused ), UserException );
	}
};

/** Optimizing an object expression optimizes its sub expressions. */
class Optimize : public Base {
public:
	void run() {
		intrusive_ptr<ExpressionObject> expression = ExpressionObject::create();
		// Add inclusion.
		expression->includePath( "a" );
		// Add non inclusion.
		expression->addField( mongo::FieldPath( "b" ), ExpressionAnd::create() );
		expression->optimize();
		// Optimizing 'expression' optimizes its non inclusion sub expressions, while
		// inclusion sub expressions are passed through.
		ASSERT_EQUALS( BSON( "a" << true << "b" << BSON( "$const" << true ) ),
					   expressionToBson( expression ) );
	}
};

/** Serialize to a BSONObj. */
class AddToBsonObj : public Base {
public:
	void run() {
		intrusive_ptr<ExpressionObject> expression = ExpressionObject::create();
		expression->addField( mongo::FieldPath( "a" ),
							  ExpressionConstant::create( Value::createInt( 5 ) ) );
		BSONObjBuilder bob;
		expression->addToBsonObj( &bob, "foo", false );
		ASSERT_EQUALS( BSON( "foo" << BSON( "a" << 5 ) ), bob.obj() );
	}
};

/** Serialize to a BSONObj, with constants represented by expressions. */
class AddToBsonObjRequireExpression : public Base {
public:
	void run() {
		intrusive_ptr<ExpressionObject> expression = ExpressionObject::create();
		expression->addField( mongo::FieldPath( "a" ),
							  ExpressionConstant::create( Value::createInt( 5 ) ) );
		BSONObjBuilder bob;
		expression->addToBsonObj( &bob, "foo", true );
		ASSERT_EQUALS( BSON( "foo" << BSON( "a" << BSON( "$const" << 5 ) ) ), bob.obj() );
	}
};

/** Serialize to a BSONArray. */
class AddToBsonArray : public Base {
public:
	void run() {
		intrusive_ptr<ExpressionObject> expression = ExpressionObject::create();
		expression->addField( mongo::FieldPath( "a" ),
							  ExpressionConstant::create( Value::createInt( 5 ) ) );
		BSONArrayBuilder bab;
		expression->addToBsonArray( &bab );
		ASSERT_EQUALS( BSON_ARRAY( BSON( "a" << 5 ) ), bab.arr() );
	}
};

/**
 * evaluate() does not supply an inclusion document.  Inclusion spec'd fields are not
 * included.  (Inclusion specs are not generally expected/allowed in cases where evaluate
 * is called instead of addToDocument.)
 */
class Evaluate : public Base {
public:
	void run() {
		intrusive_ptr<ExpressionObject> expression = ExpressionObject::create();
		expression->includePath( "a" );
		expression->addField( mongo::FieldPath( "b" ),
							  ExpressionConstant::create( Value::createInt( 5 ) ) );
		expression->addField( mongo::FieldPath( "c" ),
							  ExpressionFieldPath::create( "a" ) );
		ASSERT_EQUALS( BSON( "b" << 5 << "c" << 1 ),
					   toBson( expression->evaluate
							   ( fromBson
								 ( BSON( "_id" << 0 << "a" << 1 ) ) )->getDocument() ) );
	}
};
