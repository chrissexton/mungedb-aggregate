Differences
-----------
Here is a list of the major items where we have deviated from the MongoDB code and a little bit about why:

* **General**
	* DESIGN: A lot of these things are packed into a single `.cpp` file in the MongoDB code but to keep things clean and separate they have been broken out into files named the same and only rarely is there more than one class within a single file
	* `BSON` vs `JSON`
	* DESIGN: Basically all of the `BSON`-specific code has become equivalent `JSON`-specific code since that's what we're working with (no need for needless conversions)
	* DESIGN: A lot of these have a `addToBson...` and other `BSONObjBuilder`-related methods that take in an instance to be modified but it's owned by the caller; in `mungedb-aggregate` we build a new `Object` and return it because it's simpler and that's how they're generally used anyhow
	* TESTING: Many of the tests have been written without the use of the testing base classes as they are in the MongoDB code to try and simplify and make things more clear (but never less complete)
* **Pipeline components**
	* `Document` class
	* DESIGN: `Document` now provides static helpers rather than instance helpers to avoid unnecessary boxing/unboxing since that seems to make more sense here (we treat any `Object` like a `Document`)
	* `Value` class
	* DESIGN: `Value` now provides static helpers rather than instance helpers to avoid unnecessary boxing/unboxing since that seems to make more sense here (we treat any `Object` like a `Value)
	* NAMING: `Value#get{TYPE}` methods have been renamed to `Value.verify{TYPE}` since that seemed to make more sense given what they're really doing for us as statics
	* DESIGN: `Value.coerceToDate` static returns a JavaScript `Date` object rather than milliseconds since that seems to make more sense where possible
	* `Expression` classes
	* `Expression` base class
		* DESIGN: The nested `ObjectCtx` class no longer uses contants and bitmask flags, instead it takes an `Object` with similarly named `Boolean`s; e.g., `{isDocumentOk:true}` rather than `DOCUMENT_OK`
	* NAMING: The `Expression{FOO}` classes have all been renamed to `{FOO}Expression` to satisfy my naming OCD.
	* DESIGN: The `{FOO}Expression` classes do not provide `create` statics since calling new is easy enough
		* DESIGN: To further this, the `CompareExpression` class doesn't provide any of it's various `create{FOO}` helpers so compensate I am just binding the appropriate args to the `constructor` to create a similar factory
	* `DocumentSource` classes
	* DESIGN: We have implemented a `reset` method for all document sources so that we can reuse them against different streams of data
	* DESIGN: GroupDocumentSource stores copies of all unique _id's that it accumulates to dodge a javascript Stringify/Parse issue with dates
