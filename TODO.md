TODO
----
Here is a list of global items that I know about that may need to be done in the future:

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
