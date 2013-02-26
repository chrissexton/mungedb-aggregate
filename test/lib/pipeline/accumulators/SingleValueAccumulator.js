var assert = require("assert"),
	SingleValueAccumulator = require("../../../../lib/pipeline/accumulators/SingleValueAccumulator");

//TODO: refactor these test cases using Expression.parseOperand() or something because these could be a whole lot cleaner...
module.exports = {

	"SingleValueAccumulator": {

		"constructor()": {

	
			"should not throw Error when constructing with no args": function testConstructor(){
				assert.doesNotThrow(function(){
					new SingleValueAccumulator();
				});
			},

			"should not throw Error when constructing with 1 arg": function testConstructor(){
				assert.doesNotThrow(function(){
					new SingleValueAccumulator(null);
				});
			},
			"should throw Error when constructing with > 1 arg": function testConstructor(){
				assert.throws(function(){
					new SingleValueAccumulator(null, null);
				});
			}
		},

		"#getValue()": {

			"should return the correct value 'foo'": function testGetValue(){
				var sva = new SingleValueAccumulator();
				sva.value = "foo";
				assert.equal(sva.getValue(), "foo");
			}

		}
	}
};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
