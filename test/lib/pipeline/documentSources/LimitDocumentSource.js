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

		/*
		"#coalesce()": {

			"should return false if nextSource is not $skip": function dontSkip(){
			},
			"should return true if nextSource is $skip": function changeLimit(){
			}

		},

		"#eof()": {

			"should return true if there are no more sources": function noSources(){
			},
			"should return true if limit is hit": function hitLimit(){
			}

		},

		"#getCurrent()": {

			"should return the current document source": function currSource(){
				var lds = new LimitDocumentSource();
				lds.limit = 1;
				lds.pSource = { item:1 };
				assert.strictEqual(lds.getCurrent(), { item:1 }); 
			}

		},

		"#advance()": {

			"should return true for moving to the next source": function nextSource(){
			},

			"should return false for no sources remaining": function noMoar(){
			}

		},
		*/

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

