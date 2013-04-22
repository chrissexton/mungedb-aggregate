"use strict";
var assert = require("assert"),
	Pipeline = require("../../../lib/pipeline/Pipeline");


module.exports = {

	"Pipeline": {
		before: function(){
			Pipeline.StageDesc.$test = (function(){
			var klass = function TestDocumentSource(options){
				base.call(this);
				
				this.shouldCoalesce = options.coalesce;
				this.coalesceWasCalled = false;
				this.optimizeWasCalled = false;
				
				this.current = 5;
				
			}, TestDocumentSource = klass, base = require('../../../lib/pipeline/documentSources/DocumentSource'), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});
			
			
			proto.coalesce = function(){
				this.coalesceWasCalled = true;
				
				var c = this.shouldCoalesce;//only coalesce with the first thing we find
				this.shouldCoalesce = false;
				return c;
			};
			proto.optimize = function(){
				this.optimizeWasCalled = true;
			};
			
			proto.eof = function(){
				return this.current < 0;
			};
			proto.advance = function(){
				this.current = this.current - 1;
				return !this.eof();
			};
			proto.getCurrent = function(){
				return this.current;
			};
			klass.createFromJson = function(options){
				return new TestDocumentSource(options);
			};
			
			return klass;
		})().createFromJson;
		
		//TODO:remove this once Sort is implemented!!!
		Pipeline.SortDocumentSource = (function(){
			var klass = function SortDocumentSource(){
				
			}, SortDocumentSource = klass, base = require('../../../lib/pipeline/documentSources/DocumentSource'), proto = klass.prototype = Object.create(base.prototype, {constructor:{value:klass}});
			klass.sortName = "$sort";
			klass.createFromJson = function(options){
				return new SortDocumentSource(options);
			};
			return klass;
		})();
		Pipeline.StageDesc.$sort = Pipeline.SortDocumentSource.createFromJson;
			
		},
		"parseCommand": {
			"should fail if given non-objects in the array":function(){
				assert.throws(function(){
					Pipeline.parseCommand([5]);
				});
			},
			"should fail if given objects with more/less than one field":function(){
				assert.throws(function(){
					Pipeline.parseCommand([{}]);
				});
			},
			"should fail if given objects that dont match any known document sources":function(){
				assert.throws(function(){
					Pipeline.parseCommand([{$foo:"$sdfdf"}]);
				});
			},
			"should swap $match and $sort if the $match immediately follows the $sort":function(){
				var p = Pipeline.parseCommand([{$sort:{"xyz":1}}, {$match:{}}]);
				assert.equal(p.sourceVector[0].constructor.matchName, "$match");
				assert.equal(p.sourceVector[1].constructor.sortName, "$sort");
			},
			"should attempt to coalesce all sources":function(){
				var p = Pipeline.parseCommand([{$test:{coalesce:false}}, {$test:{coalesce:true}}, {$test:{coalesce:false}}, {$test:{coalesce:false}}]);
				assert.equal(p.sourceVector.length, 3);
				p.sourceVector.slice(0,-1).forEach(function(source){
					assert.equal(source.coalesceWasCalled, true);
				});
				assert.equal(p.sourceVector[p.sourceVector.length -1].coalesceWasCalled, false);
			},
			"should optimize all sources":function(){
				var p = Pipeline.parseCommand([{$test:{coalesce:false}}, {$test:{coalesce:false}}]);
				p.sourceVector.forEach(function(source){
					assert.equal(source.optimizeWasCalled, true);
				});
			}
		},

		"#run": {
			"should set the parent source for all sources in the pipeline except the first one":function(){
				var p = Pipeline.parseCommand([{$test:{coalesce:false}}, {$test:{coalesce:false}}, {$test:{coalesce:false}}]);
				p.run({}, []);
				assert.equal(p.sourceVector[1].pSource, p.sourceVector[0]);
				assert.equal(p.sourceVector[2].pSource, p.sourceVector[1]);
			},
			"should iterate through sources and return resultant array":function(){
				var p = Pipeline.parseCommand([{$test:{coalesce:false}}, {$test:{coalesce:false}}, {$test:{coalesce:false}}]),
					result = {};
				p.run(result, []);
				assert.deepEqual(result.result, [5,4,3,2,1,0]);//see the test source for why this should be so
			}
		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run();
