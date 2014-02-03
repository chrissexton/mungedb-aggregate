"use strict";
var assert = require("assert"),
	async = require("async"),
	DocumentSource = require("../../../../lib/pipeline/documentSources/DocumentSource"),
	MatchDocumentSource = require("../../../../lib/pipeline/documentSources/MatchDocumentSource");


module.exports = {

	"MatchDocumentSource": {

		"constructor()": {

			"should throw Error when constructing without args": function testConstructor(){
				assert.throws(function(){
					new MatchDocumentSource();
				});
			}

		},

		"#getSourceName()": {

			"should return the correct source name; $match": function testSourceName(){
				var mds = new MatchDocumentSource({ packet :{ $exists : false } });
				assert.strictEqual(mds.getSourceName(), "$match");
			}

		},

		"#serialize()": {

			"should append the match query to the input builder": function sourceToJsonTest(){
				var mds = new MatchDocumentSource({ location : { $in : ['Kentucky'] } });
				var t = mds.serialize(false);
				assert.deepEqual(t, { "$match" : { location : { $in : ['Kentucky'] } }});
			}

		},

		"#createFromJson()": {

			"should return a new MatchDocumentSource object from an input object": function createTest(){
				var t = MatchDocumentSource.createFromJson({ someval:{$exists:true} });
				assert.strictEqual(t instanceof MatchDocumentSource, true);
			}

		},

		"#getNext()": {

			"should throw an error if no callback is given": function() {
				var mds = new MatchDocumentSource({item:1});
				assert.throws(mds.getNext.bind(mds));
			},

			"should return the current document source": function currSource(next){
				var mds = new MatchDocumentSource({item: 1});
				mds.source = {getNext:function(cb){cb(null,{ item:1 });}};
				mds.getNext(function(err,val) {
					assert.deepEqual(val, { item:1 });
					next();
				});
			},

			"should return matched sources remaining": function (next){
				var mds = new MatchDocumentSource({ item: {$lt: 5} }),
					items = [ 1,2,3,4,5,6,7,8,9 ];
				mds.source = {
					calls: 0,
					getNext:function(cb) {
						if (this.calls >= items.length)
							return cb(null,DocumentSource.EOF);
						return cb(null,{item: items[this.calls++]});
					},
					dispose:function() { return true; }
				};

				async.series([
						mds.getNext.bind(mds),
						mds.getNext.bind(mds),
						mds.getNext.bind(mds),
						mds.getNext.bind(mds),
						mds.getNext.bind(mds),
					],
					function(err,res) {
						assert.deepEqual([{item:1},{item:2},{item:3},{item:4},DocumentSource.EOF], res);
						next();
					}
				);
			},

			"should not return matched out documents for sources remaining": function (next){
				var mds = new MatchDocumentSource({ item: {$gt: 5} }),
					items = [ 1,2,3,4,5,6,7,8,9 ];
				mds.source = {
					calls: 0,
					getNext:function(cb) {
						if (this.calls >= items.length)
							return cb(null,DocumentSource.EOF);
						return cb(null,{item: items[this.calls++]});
					},
					dispose:function() { return true; }
				};

				async.series([
						mds.getNext.bind(mds),
						mds.getNext.bind(mds),
						mds.getNext.bind(mds),
						mds.getNext.bind(mds),
						mds.getNext.bind(mds),
					],
					function(err,res) {
						assert.deepEqual([{item:6},{item:7},{item:8},{item:9},DocumentSource.EOF], res);
						next();
					}
				);
			},

			"should return EOF for no sources remaining": function (next){
				var mds = new MatchDocumentSource({ item: {$gt: 5} }),
					items = [ ];
				mds.source = {
					calls: 0,
					getNext:function(cb) {
						if (this.calls >= items.length)
							return cb(null,DocumentSource.EOF);
						return cb(null,{item: items[this.calls++]});
					},
					dispose:function() { return true; }
				};

				async.series([
						mds.getNext.bind(mds),
					],
					function(err,res) {
						assert.deepEqual([DocumentSource.EOF], res);
						next();
					}
				);
			},

		},

		"#coalesce()": {

			"should return false if nextSource is not $match": function dontSkip(){
				var mds = new MatchDocumentSource({item: {$lt:3}});
				assert.equal(mds.coalesce({}), false);
			},
			"should return true if nextSource is $limit": function changeLimit(){
				var mds = new MatchDocumentSource({item:{$gt:1}}),
					mds2 = new MatchDocumentSource({item:{$lt:3}}),
					expected = {$and: [{item:{$gt:1}}, {item:{$lt:3}}]};

				var actual = mds.coalesce(mds2);
				assert.equal(actual, true);
				assert.deepEqual(mds.getQuery(), expected);
			}

		},

		"#getQuery()": {

			"should return current query": function () {
				var mds = new MatchDocumentSource({item: {$gt:1}});
				var actual = mds.getQuery();

				assert.deepEqual(actual, {item:{$gt:1}});
			}

		},

		"#redactSafePortion()": {

			"should throw unimplemented, for now": function() {
				var mds = new MatchDocumentSource({$gt:1});
				assert.throws(mds.redactSafePortion);
			}

		}

	}

};


if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
