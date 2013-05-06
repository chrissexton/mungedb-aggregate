"use strict";
var assert = require("assert"),
	aggregate = require("../../");

module.exports = {

	"aggregate": {

		"should be able to use an empty pipeline (no-op)": function(){
			var i = [1, 2, 3],
				p = [],
				e = [1, 2, 3],
				aggregater = aggregate(p),
				a = aggregater(i);
			assert.equal(JSON.stringify(a), JSON.stringify(e), "Unexpected value!");
			assert.deepEqual(a, e, "Unexpected value (not deepEqual)!");
			assert.equal(JSON.stringify(aggregater(i)), JSON.stringify(e), "Reuse of aggregater should yield the same results!");
			assert.equal(JSON.stringify(aggregate(p, i)), JSON.stringify(e), "Alternate use of aggregate should yield the same results!");
		},


		"should be able to use a $limit operator": function(){
			var i = [{_id:0}, {_id:1}, {_id:2}, {_id:3}, {_id:4}, {_id:5}],
				p = [{$limit:2}],
				e = [{_id:0}, {_id:1}],
				aggregater = aggregate(p),
				a = aggregater(i);
			assert.equal(JSON.stringify(a), JSON.stringify(e), "Unexpected value!");
			assert.deepEqual(a, e, "Unexpected value (not deepEqual)!");
			assert.equal(JSON.stringify(aggregater(i)), JSON.stringify(e), "Reuse of aggregater should yield the same results!");
			assert.equal(JSON.stringify(aggregate(p, i)), JSON.stringify(e), "Alternate use of aggregate should yield the same results!");
		},

		"should be able to use a $match operator": function(){
			var i = [{_id:0, e:1}, {_id:1, e:0}, {_id:2, e:1}, {_id:3, e:0}, {_id:4, e:1}, {_id:5, e:0}],
				p = [{$match:{e:1}}],
				e = [{_id:0, e:1}, {_id:2, e:1}, {_id:4, e:1}],
				aggregater = aggregate(p),
				a = aggregater(i);
			assert.equal(JSON.stringify(a), JSON.stringify(e), "Unexpected value!");
			assert.deepEqual(a, e, "Unexpected value (not deepEqual)!");
			assert.equal(JSON.stringify(aggregater(i)), JSON.stringify(e), "Reuse of aggregater should yield the same results!");
			assert.equal(JSON.stringify(aggregate(p, i)), JSON.stringify(e), "Alternate use of aggregate should yield the same results!");
		},
		
		"should be able to use a $skip operator": function(){
			var i = [{_id:0}, {_id:1}, {_id:2}, {_id:3}, {_id:4}, {_id:5}],
				p = [{$skip:2}, {$skip:1}],	//testing w/ 2 ensures independent state variables
				e = [{_id:3}, {_id:4}, {_id:5}],
				aggregater = aggregate(p),
				a = aggregater(i);
			assert.equal(JSON.stringify(a), JSON.stringify(e), "Unexpected value!");
			assert.deepEqual(a, e, "Unexpected value (not deepEqual)!");
			assert.equal(JSON.stringify(aggregater(i)), JSON.stringify(e), "Reuse of aggregater should yield the same results!");
			assert.equal(JSON.stringify(aggregate(p, i)), JSON.stringify(e), "Alternate use of aggregate should yield the same results!");
		},
		"should be able to use a $skip and then a $limit operator together in the same pipeline": function(){
			var i = [{_id:0, e:1}, {_id:1, e:0}, {_id:2, e:1}, {_id:3, e:0}, {_id:4, e:1}, {_id:5, e:0}],
				p = [{$skip:2}, {$limit:1}],
				e = [{_id:2, e:1}],
				aggregater = aggregate(p),
				a = aggregater(i);
			assert.equal(JSON.stringify(a), JSON.stringify(e), "Unexpected value!");
			assert.deepEqual(a, e, "Unexpected value (not deepEqual)!");
			assert.equal(JSON.stringify(aggregater(i)), JSON.stringify(e), "Reuse of aggregater should yield the same results!");
			assert.equal(JSON.stringify(aggregate(p, i)), JSON.stringify(e), "Alternate use of aggregate should yield the same results!");
		},

		"should be able to construct an instance with $unwind operators properly": function(){
			var i = [
					{_id:0, nodes:[
						{one:[11], two:[2,2]},
						{one:[1,1], two:[22]}
					]},
					{_id:1, nodes:[
						{two:[22], three:[333]},
						{one:[1], three:[3,3,3]}
					]}
				],
				p = [{$unwind:"$nodes"}, {$unwind:"$nodes.two"}],
				e = [
					{_id:0,nodes:{one:[11],two:2}},
					{_id:0,nodes:{one:[11],two:2}},
					{_id:0,nodes:{one:[1,1],two:22}},
					{_id:1,nodes:{two:22,three:[333]}}
				],
				aggregater = aggregate(p),
				a = aggregater(i);
			assert.equal(JSON.stringify(a), JSON.stringify(e), "Unexpected value!");
			assert.deepEqual(a, e, "Unexpected value (not deepEqual)!");
			assert.equal(JSON.stringify(aggregater(i)), JSON.stringify(e), "Reuse of aggregater should yield the same results!");
			assert.equal(JSON.stringify(aggregate(p, i)), JSON.stringify(e), "Alternate use of aggregate should yield the same results!");
		},


		"should be able to use a $project operator": function(){
			var i = [{_id:0, e:1, f:23}, {_id:2, e:2, g:34}, {_id:4, e:3}],
				p = [{$project:{
						e:1, 
						a:{$add:["$e", "$e"]}, 
						b:{$cond:[{$eq:["$e", 2]}, "two", "not two"]}
						//TODO: high level test of all other expression operators
					}}],
				e = [{_id:0, e:1, b:"not two", a:2}, {_id:2, e:2, b:"two", a:4}, {_id:4, e:3, b:"not two", a:6}],
				aggregater = aggregate(p),
				a = aggregater(i);
			assert.deepEqual(a, e, "Unexpected value (not deepEqual)!");
			assert.deepEqual(aggregater(i), e, "Reuse of aggregater should yield the same results!");
			assert.deepEqual(aggregate(p, i), e, "Alternate use of aggregate should yield the same results!");
		},
		
		
		"should be able to use a $project operator to exclude the _id field": function(){
			var i = [{_id:0, e:1, f:23}, {_id:2, e:2, g:34}, {_id:4, e:3}],
				p = [{$project:{
						_id:0,
						e:1
						//TODO: high level test of all other expression operators
					}}],
				e = [{e:1}, {e:2}, {e:3}],
				aggregater = aggregate(p),
				a = aggregater(i);
			assert.deepEqual(a, e, "Unexpected value (not deepEqual)!");
			assert.deepEqual(aggregater(i), e, "Reuse of aggregater should yield the same results!");
			assert.deepEqual(aggregate(p, i), e, "Alternate use of aggregate should yield the same results!");
		},

		"should be able to construct an instance with $sort operators properly (ascending)": function(){
			var i = [
						{_id:3.14159}, {_id:-273.15},
						{_id:42}, {_id:11}, {_id:1},
						{_id:null}, {_id:NaN}
					],
				p = [{$sort:{_id:1}}],
				e = [
						{_id:null}, {_id:NaN},
						{_id:-273.15}, {_id:1}, {_id:3.14159}, {_id:11}, {_id:42}
					],
				aggregater = aggregate(p),
				a = aggregater(i);
			assert.equal(JSON.stringify(a), JSON.stringify(e), "Unexpected value!");
			//assert.deepEqual(a, e); //does not work with NaN
			assert.equal(JSON.stringify(aggregater(i)), JSON.stringify(e), "Reuse of aggregater should yield the same results!");
			assert.equal(JSON.stringify(aggregate(p, i)), JSON.stringify(e), "Alternate use of aggregate should yield the same results!");
		},
		"should be able to construct an instance with $group operators properly": function(){
			var i = [
						{_id:0, a:1},
						{_id:0, a:2},
						{_id:0, a:3},
						{_id:0, a:4},
						{_id:0, a:1.5},
						{_id:0, a:null},
						{_id:1, b:"a"},
						{_id:1, b:"b"},
						{_id:1, b:"b"},
						{_id:1, b:"c"}
					],
				p = [{$group:{
						_id:"$_id",
						sum_a:{$sum:"$a"},
						//min_a:{$min:"$a"}, //this is busted in this version of mongo
						max_a:{$max:"$a"},
						avg_a:{$avg:"$a"},
						first_b:{$first:"$b"},
						last_b:{$last:"$b"},
						addToSet_b:{$addToSet:"$b"},
						push_b:{$push:"$b"}
					}}],
				e = [
						{
							_id:0,
							sum_a:11.5,
							//min_a:1,
							max_a:4,
							avg_a:2.3,
							first_b:undefined,
							last_b:undefined,
							addToSet_b:[],
							push_b:[]
						},
						{
							_id:1,
							sum_a:0,
							//min_a:null,
							max_a:undefined,
							avg_a:0,
							first_b:"a",
							last_b:"c",
							addToSet_b:["a", "b", "c"],
							push_b:["a", "b", "b", "c"]
						}
					],
				aggregater = aggregate(p),
				a = aggregater(i);
			assert.equal(JSON.stringify(a), JSON.stringify(e), "Unexpected value!");
			//assert.deepEqual(a, e); //does not work with NaN
			assert.equal(JSON.stringify(aggregater(i)), JSON.stringify(e), "Reuse of aggregater should yield the same results!");
			assert.equal(JSON.stringify(aggregate(p, i)), JSON.stringify(e), "Alternate use of aggregate should yield the same results!");
		},

		"should be able to use a $split operator": function(){
			var i = [{_id:0, a:1}, {_id:1, a:1}, {_id:2, a:1}, {_id:3, a:1}, {_id:4, a:1}, {_id:5, a:1}],
				p = [{$match:{_id:0}}, {$split:{aX2:[{$project:{a:{$multiply:["$a", 2]}}}], aX3:[{$project:{a:{$multiply:["$a", 3]}}}]}}, {$unwind:"$aX2"}, {$unwind:"$aX3"}],
				//e = [{aX2:[{_id:0, a:2}], aX3:[{_id:0, a:3}]}],
				e = [{aX2:{_id:0, a:2}, aX3:{_id:0, a:3}}],
				aggregater = aggregate(p),
				a = aggregater(i);
			assert.equal(JSON.stringify(a), JSON.stringify(e), "Unexpected value!");
			assert.deepEqual(a, e, "Unexpected value (not deepEqual)!");
			assert.equal(JSON.stringify(aggregater(i)), JSON.stringify(e), "Reuse of aggregater should yield the same results!");
			assert.equal(JSON.stringify(aggregate(p, i)), JSON.stringify(e), "Alternate use of aggregate should yield the same results!");
		},

	}

};

if(!module.parent) (new (require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run();