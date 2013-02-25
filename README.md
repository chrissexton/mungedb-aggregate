munge
=====
A JavaScript data munging pipeline based on the MongoDB aggregation framework.

In general, this code is a port from the MongoDB C++ code (v2.4.0) to JavaScript.



exports
-------
**TODO:** document the major exports and a little about each here



Deviations
----------
Here is a list of the major items where we have deviated from the MongoDB code and a little bit about why:

  * Pipeline classes
    * the `Document` class
      * DESIGN: `Document` now provides static helpers rather than instance helpers to avoid unecessary boxing/unboxing since that seems to make more sense here (we treat any `Object` like a `Document`)
    * the `Expression` class
      * DESIGN: the nested `ObjectCtx` class no longer uses contants and a bit flags but instead uses similarly named boolean; e.g., `isDocumentOk` rather than `DOCUMENT_OK`
    * the `Value` class
      * DESIGN: `Value` now provides static helpers rather than instance helpers to avoid unecessary boxing/unboxing since that seems to make more sense here (we treat any `Object` like a `Value)
      * NAMING: `Value#get{TYPE}` methods have been renamed to `Value.verify{TYPE}` since that seemed to make more sense given what they're really doing for us as statics
      * DESIGN: `Value.coerceToDate` static returns a JavaScript `Date` object rather than milliseconds since that seems to make more sense where possible
    * NAMING: The `Expression{FOO}` classes have all been renamed to `{FOO}Expression` to satisfy my naming OCD.
    * DESIGN: The `{FOO}Expression` classes do not provide `create` statics since calling new is easy enough
      * DESIGN: To further this, the `CompareExpression` class doesn't provide any of it's additional `create{FOO}` helpers so instead I'm binding the appropriate args to the ctor
    * TESTING: Many of the expression tests have been written without the use of the testing base classes to make things a little more clear (but not less complete)
  * BSON vs JSON
    * DESIGN: Basically all of the `BSON`-specific code has become equivalent `JSON`-specific code since that's what we're working with (no need for needless conversions)
    * DESIGN: A lot of these have a `addToBson...` and other `BSONObjBuilder`-related methods that take in an instance to be modified but it's owned by the caller; in `munge` we build a new `Object` and return it because it's simpler and that's how they're generally used anyhow
  * Document sources
  	* we have implemented a 'reset' method for all document sources so that we can reuse them against different streams of data


TODO
----
Here is a list of global items that I know about that may need to be done in the future:

  * Go through the TODOs....
  * `getOpName` should be static!
  * Need a method by which consumers can provide their own extensions
  * Move expression name to the ctor? or at least a const prototype property or something
  * NAMING: need to go back through and make sure that places referencing <Document> in the C++ code are represented here by referencing a var called "doc" or similar
  * Currently using JS types but may need to support `BSON` types to do everything properly; affects handling of `ObjectId`, `ISODate`, and `Timestamp`
  * Go through test cases and try to turn `assert.equal()` calls into `assert.strictEqual()` calls
  * Replace `exports = module.exports =` with `module.exports =` only
  * Go through uses of `throw` and make them actually use `UserException` vs `SystemException` (or whatever they're called)
  * Go through and fix the `/** documentation **/` to ensure that they are YUIDoc-fiendly and exist on multiple lines
  * Go through and modify classes to use advanced OO property settings properly (`seal`, `freeze`, etc.) where appropriate
  * Make sure that nobody is using private (underscored) variables that they shouldn't be...might have broken encapsulation somewhere along the way...
  * Make sure  that all of the pure `virtual`s (i.e., /virtual .* = 0;$/) are implemented as a proto with a throw new Error("NOT IMPLEMENTED BY INHERITOR") or similar