var assert = require("assert"),
	SingleValueAccumulator = require("../../../../lib/pipeline/accumulator/SingleValueAccumulator");

//TODO: refactor these test cases using Expression.parseOperand() or something because these could be a whole lot cleaner...
module.exports = {

	"SingleValueAccumulator": {

		"constructor()": {

			"should not throw Error when constructing with 1 arg": function testConstructor(){
				assert.doesNotThrow(function(){
					new SingleValueAccumulator(null);
				});
			},
			"should throw Error when constructing with > 1 arg": function testConstructor(){
				assert.throws(function(){
					new SingleValueAccumulator(null, null);
				});
			},
			"should throw Error when constructing with < 1 arg": function testConstructor(){
				assert.throws(function(){
					new SingleValueAccumulator();
				});
			}
		},

		"#getValue()": {

			"should return the correct value 'foo'": function testGetValue(){
				assert.equal(new SingleValueAccumulator("foo").getValue(), "foo");
			}

		}
	}
};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run(process.exit);
