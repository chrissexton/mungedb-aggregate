mungedb-aggregate
=================
A JavaScript data aggregation pipeline based on the [MongoDB][MongoDB]
database's [aggregation framework][Aggregation].

Based on the MongoDB C++ code (v2.4.0).

Updating to v2.6 soon.



Why
---
MongoDB Aggregation and JavaScript are both awesome. We put them together.

Now, with the ease of JavaScript and the power of the MongoDB aggregation
pipeline, we can provide a single API for data munging, regardless of where
execution occurs. You can extend the base functionality to suit your needs.



Example
-------
```javascript
var aggregate = require("mungedb-aggregate");

var inputs = [
  {v: 1},
  {v: 2},
  {v: 3},
  {v: 4},
  {v: 5}
];

var pipeline = [
  {$match:{
    v: {$gte: 3}
  }},
  {$project:{
    v2: {$multiply: ["$v", "$v"]}
  }}
];

aggregate(pipeline, inputs);  // => [{v2:9}, {v2:16}, {v2:25}]
```


API
---

Public parts:

* `aggregate(pipeline, [inputs], [callback])` - The data aggregator
 - `pipeline`   - The [aggregation][Aggregation] pipeline to apply to `inputs`
 - `[inputs]`   - The input Objects to aggregate or return curried if omitted
 - `[callback]` - The callback if needed (for extensions using async calls)
* `version` - The MongoDB version that this code represents
* `gitVersion` - The MongoDB git revision that this code represents

Inner workings:

* `Cursor` - Used to go thru data (by `PipelineD` and `CursorDocumentSource`)
* `pipeline`
  - `Pipeline`        - The pipeline handler
  - `PipelineD`       - The pipeline data reader helper
  - `FieldPath`       - Represents a path to a field within a document
  - `Document`        - Document helpers used throughout the code
  - `Value`           - Value helpers used throughout the code
  - `accumulators`    - The `Accumulator` classes (used in `$group`)
  - `documentSources` - The `DocumentSource` classes (upper pipeline objects)
  - `expressions`     - The `Expression` classes (used in `$project`)



[MongoDB]: http://www.mongodb.org
[Aggregation]: http://docs.mongodb.org/manual/core/aggregation-introduction/
