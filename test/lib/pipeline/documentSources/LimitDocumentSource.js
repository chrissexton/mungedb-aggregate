var assert = require("assert"),
	LimitDocumentSource = require("../../../../lib/pipeline/documentSources/LimitDocumentSource");

module.exports = {

	"LimitDocumentSource": {

		"constructor()": {

			"should not throw Error when constructing without args": function testConstructor(){
				assert.doesNotThrow(function(){
					new LimitDocumentSource();
				});
			}

		},

		"#getSourceName()": {

			"should return the correct source name; $limit": function testSourceName(){
				var lds = new LimitDocumentSource();
				assert.strictEqual(lds.getSourceName(), "$limit");
			}

		},

		"#getFactory()": {

			"should return the constructor for this class": function factoryIsConstructor(){
				assert.strictEqual(new LimitDocumentSource().getFactory(), LimitDocumentSource);
			}

		},

		"#coalesce()": {

			"should return false if nextSource is not $limit": function dontSkip(){
				var lds = new LimitDocumentSource();
				assert.equal(lds.coalesce({}), false);
			},
			"should return true if nextSource is $limit": function changeLimit(){
				var lds = new LimitDocumentSource();
				assert.equal(lds.coalesce(new LimitDocumentSource()), true);
			}

		},

		"#eof()": {

			"should return true if there are no more sources": function noSources(){
				var lds = new LimitDocumentSource();
				lds.limit = 9;
				lds.count = 0;
				lds.pSource = {
					eof: function(){
						return true;
					}
				};
				assert.equal(lds.eof(), true);
			},
			"should return true if limit is hit": function hitLimit(){
				var lds = new LimitDocumentSource();
				lds.limit = 9;
				lds.count = 9;
				lds.pSource = {
					eof: function(){
						return false;
					}
				};
				assert.equal(lds.eof(), true);
			},
			"should return false if limit is not hit and there are more documents": function hitLimit(){
				var lds = new LimitDocumentSource();
				lds.limit = 10;
				lds.count = 9;
				lds.pSource = {
					eof: function(){
						return false;
					}
				};
				assert.equal(lds.eof(), false);
			}

		},

		"#getCurrent()": {

			"should return the current document source": function currSource(){
				var lds = new LimitDocumentSource();
				lds.limit = 1;
				lds.pSource = {getCurrent:function(){return { item:1 };}};
				assert.deepEqual(lds.getCurrent(), { item:1 }); 
			}

		},

		"#advance()": {

			"should return true for moving to the next source": function nextSource(){
				var lds = new LimitDocumentSource();
				lds.count = 0;
				lds.limit = 2;
				lds.pSource = {
					getCurrent:function(){return { item:1 };},
					advance:function(){return true;}
				};
				assert.strictEqual(lds.advance(), true); 
			},

			"should return false for no sources remaining": function noMoar(){
				var lds = new LimitDocumentSource();
				lds.limit = 1;
				lds.pSource = {
					getCurrent:function(){return { item:1 };},
					advance:function(){return false;}
				};
				assert.strictEqual(lds.advance(), false); 
			},

			"should return false if we hit our limit": function noMoar(){
				var lds = new LimitDocumentSource();
				lds.limit = 1;
				lds.pSource = {
					getCurrent:function(){return { item:1 };},
					advance:function(){return true;}
				};
				assert.strictEqual(lds.advance(), false); 
			}

		},

		"#sourceToJson()": {

			"should create an object with a key $limit and the value equal to the limit": function sourceToJsonTest(){
				var lds = new LimitDocumentSource();
				lds.limit = 9;
				var t = {};
				lds.sourceToJson(t, false);
				assert.deepEqual(t, { "$limit": 9 });
			}

		},

		"#createFromJson()": {

			"should return a new LimitDocumentSource object from an input number": function createTest(){
				var lds = new LimitDocumentSource();
				var t = lds.createFromJson(5);
				assert.strictEqual(t, LimitDocumentSource);
				assert.strictEqual(t.limit, 5);
			}

		}


	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);

