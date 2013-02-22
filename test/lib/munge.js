var assert = require("assert"),
	munge = require("../../");

module.exports = {

	"munge": {

		"should be able to use an empty pipeline (no-op)": function(){
			var i = [1, 2, 3],
				p = [],
				e = [1, 2, 3],
				munger = munge(p),
				a = munger(i);
			assert.equal(JSON.stringify(a), JSON.stringify(e), "Unexpected value!");
			assert.deepEqual(a, e, "Unexpected value (not deepEqual)!");
			assert.equal(JSON.stringify(munger(i)), JSON.stringify(e), "Reuse of munger should yield the same results!");
			assert.equal(JSON.stringify(munge(p, i)), JSON.stringify(e), "Alternate use of munge should yield the same results!");
		},


		"should be able to use a $limit operator": function(){
			var i = [{_id:0}, {_id:1}, {_id:2}, {_id:3}, {_id:4}, {_id:5}],
				p = [{$limit:2}],
				e = [{_id:0}, {_id:1}],
				munger = munge(p),
				a = munger(i);
			assert.equal(JSON.stringify(a), JSON.stringify(e), "Unexpected value!");
			assert.deepEqual(a, e, "Unexpected value (not deepEqual)!");
			assert.equal(JSON.stringify(munger(i)), JSON.stringify(e), "Reuse of munger should yield the same results!");
			assert.equal(JSON.stringify(munge(p, i)), JSON.stringify(e), "Alternate use of munge should yield the same results!");
		},

		"should be able to use a $match operator": function(){
			var i = [{_id:0, e:1}, {_id:1, e:0}, {_id:2, e:1}, {_id:3, e:0}, {_id:4, e:1}, {_id:5, e:0}],
				p = [{$match:{e:1}}],
				e = [{_id:0, e:1}, {_id:2, e:1}, {_id:4, e:1}],
				munger = munge(p),
				a = munger(i);
			assert.equal(JSON.stringify(a), JSON.stringify(e), "Unexpected value!");
			assert.deepEqual(a, e, "Unexpected value (not deepEqual)!");
			assert.equal(JSON.stringify(munger(i)), JSON.stringify(e), "Reuse of munger should yield the same results!");
			assert.equal(JSON.stringify(munge(p, i)), JSON.stringify(e), "Alternate use of munge should yield the same results!");
		},
		
/*
		"should be able to use a $skip operator": function(){
			var i = [{_id:0}, {_id:1}, {_id:2}, {_id:3}, {_id:4}, {_id:5}],
				p = [{$skip:2}, {$skip:1}],	//testing w/ 2 ensures independent state variables
				e = [{_id:3}, {_id:4}, {_id:5}],
				munger = munge(p),
				a = munger(i);
			assert.equal(JSON.stringify(a), JSON.stringify(e), "Unexpected value!");
			assert.deepEqual(a, e, "Unexpected value (not deepEqual)!");
			assert.equal(JSON.stringify(munger(i)), JSON.stringify(e), "Reuse of munger should yield the same results!");
			assert.equal(JSON.stringify(munge(p, i)), JSON.stringify(e), "Alternate use of munge should yield the same results!");
		},
		"should be able to use a $skip and then a $limit operator together in the same pipeline": function(){
			var i = [{_id:0, e:1}, {_id:1, e:0}, {_id:2, e:1}, {_id:3, e:0}, {_id:4, e:1}, {_id:5, e:0}],
				p = [{$skip:2}, {$limit:1}],
				e = [{_id:2, e:1}],
				munger = munge(p),
				a = munger(i);
			assert.equal(JSON.stringify(a), JSON.stringify(e), "Unexpected value!");
			assert.deepEqual(a, e, "Unexpected value (not deepEqual)!");
			assert.equal(JSON.stringify(munger(i)), JSON.stringify(e), "Reuse of munger should yield the same results!");
			assert.equal(JSON.stringify(munge(p, i)), JSON.stringify(e), "Alternate use of munge should yield the same results!");
		},


		"should be able to use a $project operator": function(){
			var i = [{_id:0, e:1}, {_id:1, e:0}, {_id:2, e:1}, {_id:3, e:0}, {_id:4, e:1}, {_id:5, e:0}],
				p = [{$project:{e:1}}],
				e = [{_id:0, e:1}, {_id:2, e:1}, {_id:4, e:1}],
				munger = munge(p),
				a = munger(i);
			assert.equal(JSON.stringify(a), JSON.stringify(e), "Unexpected value!");
			assert.deepEqual(a, e, "Unexpected value (not deepEqual)!");
			assert.equal(JSON.stringify(munger(i)), JSON.stringify(e), "Reuse of munger should yield the same results!");
			assert.equal(JSON.stringify(munge(p, i)), JSON.stringify(e), "Alternate use of munge should yield the same results!");
		},

//TODO: $project w/ expressions

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
				munger = munge(p),
				a = munger(i);
			assert.equal(JSON.stringify(a), JSON.stringify(e), "Unexpected value!");
			assert.deepEqual(a, e, "Unexpected value (not deepEqual)!");
			assert.equal(JSON.stringify(munger(i)), JSON.stringify(e), "Reuse of munger should yield the same results!");
			assert.equal(JSON.stringify(munge(p, i)), JSON.stringify(e), "Alternate use of munge should yield the same results!");
		},

		"should be able to construct an instance with $sort operators properly (ascending)": function(){
			var i = [
						{_id:3.14159}, {_id:-273.15},
						{_id:42}, {_id:11}, {_id:1},
						{_id:false},{_id:true},
						{_id:""}, {_id:"a"}, {_id:"A"}, {_id:"Z"}, {_id:"z"},
						{_id:null}, {_id:NaN},
						//TODO: test with Objects; e.g., {_id:{a:{b:1}},
						{_id:new Date("2012-10-22T08:01:21.235Z")}, {_id:new Date("2012-10-15T15:48:55.181Z")}
					],
				p = [{$sort:{_id:1}}],
				e = [
						{_id:null}, {_id:NaN},
						{_id:-273.15}, {_id:1}, {_id:3.14159}, {_id:11}, {_id:42},
						{_id:""}, {_id:"A"}, {_id:"Z"}, {_id:"a"}, {_id:"z"},
						{_id:false}, {_id:true},
						{_id:new Date("2012-10-15T15:48:55.181Z")}, {_id:new Date("2012-10-22T08:01:21.235Z")}
					];
			var a = munge(p, i);
			assert.equal(JSON.stringify(a), JSON.stringify(e), "Unexpected value!");
		}
*/
	}

};

if(!module.parent) (new (require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run();
