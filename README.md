mungedb-aggregate
=================
A JavaScript data aggregation pipeline based on the MongoDB aggregation framework.

In general, this code is a port from the MongoDB C++ code (v2.4.0) to JavaScript.


WHY?!
-----
MongoDB is awesome. JavaScript is awesome. So we decided to put them together.

Now, with the ease of JavaScript and the power of the MongoDB aggregation pipeline, we can provide a single API for data munging, regardless of where execution occurs.


EXAMPLE
-------
```
// REQUIRE STUFF
var assert = require("assert");
var aggregate = require("mungedb-aggregate");

// SETUP SOME VARIABLES
var inputs = [{val:1}, {val:2}, {val:3}, {val:4}, {val:5}],
	pipeline = [
		{$match:{
			val: {$gte:3}
		}},
		{$project:{
			square: {$multiply:["$val", "$val"]}
		}}
	];

// SINGLE INPUT USAGE
aggregate(pipeline, inputs, function(err, results){
	assert.deepEqual(results, [{square:9}, {square:16}, {square:25}]);	// look ma, no server!
});

// MULTI INPUT USAGE
var aggregator = aggregate(pipeline);
aggregator(inputs, function(err, results){
	assert.deepEqual(results, [{square:9}, {square:16}, {square:25}]);	// look ma, no server!
});
aggregator(inputs, function(err, results){
	assert.deepEqual(results, [{square:9}, {square:16}, {square:25}]);	// look ma, no server!
});

```


EXPORTS
-------
Main publics:

* `aggregate` -- this is also the root of the package exports
* `version`  --  The MongoDB version that this code represents
* `gitVersion`  --  And, if you want to get really specific, the MongoDB git version that this code represents

Inner workings:

* `Cursor` -- Used internally to go through data (by `PipelineD` and `CursorDocumentSource`)
* `pipeline`
  * `Pipeline`  --  The pipeline handler
  * `PipelineD`  --  The pipeline data reader helper
  * `FieldPath`  --  Represents a path to a field within a document
  * `Document`  --  Document helpers used throughout the code
  * `Value`  --  Value helpers used throughout the code
  * `accumulators`  --  All of the `Accumulator` classes, which are used for `$group`
  * `documentSources`  --  All of the `DocumentSource` classes, which are used as the top-level pipeline components / stages
  * `expressions`  --  All of the `Expression` classes, which are used as the building blocks for many things, but especially for `$project`


DEVIATIONS
----------
Here is a list of the major items where we have deviated from the MongoDB code and a little bit about why:

  * **General**
    * DESIGN: A lot of these things are packed into a single `.cpp` file in the MongoDB code but to keep things clean and separate they have been broken out into files named the same and only rarely is there more than one class within a single file
    * `BSON` vs `JSON`
      * DESIGN: Basically all of the `BSON`-specific code has become equivalent `JSON`-specific code since that's what we're working with (no need for needless conversions)
      * DESIGN: A lot of these have a `addToBson...` and other `BSONObjBuilder`-related methods that take in an instance to be modified but it's owned by the caller; in `mungedb-aggregate` we build a new `Object` and return it because it's simpler and that's how they're generally used anyhow
    * TESTING: Many of the tests have been written without the use of the testing base classes as they are in the MongoDB code to try and simplify and make things more clear (but never less complete)
  * **Pipeline components**
    * `Document` class
      * DESIGN: `Document` now provides static helpers rather than instance helpers to avoid unecessary boxing/unboxing since that seems to make more sense here (we treat any `Object` like a `Document`)
    * `Value` class
      * DESIGN: `Value` now provides static helpers rather than instance helpers to avoid unecessary boxing/unboxing since that seems to make more sense here (we treat any `Object` like a `Value)
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


TODO
----
Here is a list of global items that I know about that may need to be done in the future:

  * Go through the TODOs....
  * NAMING: need to go back through and make sure that places referencing <Document> in the C++ code are represented here by referencing a var called "doc" or similar
  * Go through test cases and try to turn `assert.equal()` calls into `assert.strictEqual()` calls
  * Go through and modify classes to use advanced OO property settings properly (`seal`, `freeze`, etc.) where appropriate
  * Make sure that nobody is using private (underscored) variables that they shouldn't be ...might have broken encapsulation somewhere along the way...
  * Make sure that all of the pure `virtual`s (i.e., `/virtual .* = 0;$/`) are implemented as a proto with a throw new Error("NOT IMPLEMENTED BY INHERITOR") or similar
  * Go through uses of `throw` and make them actually use `UserException` vs `SystemException` (or whatever they're called)
  * Currently using the `sift` package to fake the `MatchDocumentSource` class but need to actually port the real code
  * Async support has been partially implemented but this needs to go deeper into the APIs; all layers need async capabilities (but not requirements), and layers that require it but recieve no callback should throw an Error()
  * Consider ditching `PipelineD` entirely here; might be more confusing than helpful and can still achieve the same results with ease
  * Setup a browserify build step to create a browser version of this or something
  * $group and $group.$addToSet both use JSON.stringify for key checks but really need a deepEqual (via Document.compare) or maybe use jsonplus (faster?) ... fix me now!
  * Consider moving async stuff out of here and up to a higher level package if possible just to keep things clean and as close to the MongoDB implementations as possible
