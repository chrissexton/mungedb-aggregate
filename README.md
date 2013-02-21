munge
=====
A JavaScript data munging pipeline based on the MongoDB aggregation framework.



exports
=======
**TODO:** document the major exports and a little about each here



Deviations
===========
Here is a list of the major items where I have deviated from the MongoDB code and why:

  * Pipeline Expressions
    * Value class
      * DESIGN: `Value` now provides static helpers rather than instance helpers since that seems to make more sense here
      * NAMING: `Value#get{TYPE}` methods have been renamed to `Value.verify{TYPE}` since that seemed to make more sense given what they're really doing for us as statics
      * DESIGN: `Value.coerceToDate` static returns a JavaScript `Date` object rather than milliseconds since that seems to make more sense where possible
    * NAMING: The `Expression{FOO}` classes have all been renamed to `{FOO}Expression` to satisfy my naming OCD.
    * DESIGN: The `{FOO}Expression` classes do not provide `create` statics since calling new is easy enough
      * DESIGN: To further this, the `CompareExpression` class doesn't provide any of it's additional `create{FOO}` helpers so instead I'm binding the appropriate args to the ctor
    * TESTING: Most of the expression tests have been written without the expression test base classes
  * Document sources
  	* we have implemented a 'reset' method for all document sources so that we can reuse them against different streams of data


TODO
====
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
