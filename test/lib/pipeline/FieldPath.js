var assert = require("assert"),
	FieldPath = require("../../../lib/pipeline/FieldPath");

module.exports = {

	"FieldPath": {

		"constructor(path)": {

			"should throw Error if given an empty path String": function empty() {
				assert.throws(function() {
					new FieldPath("");
				});
			},

			"should throw Error if given an empty path Array": function emptVector() {
				assert.throws(function() {
					new FieldPath([]);
				});
			},

			"should accept simple paths as a String (without dots)": function simple() {
				var path = new FieldPath("foo");
				assert.equal(path.getPathLength(), 1);
				assert.equal(path.getFieldName(0), "foo");
				assert.equal(path.getPath(false), "foo");
				assert.equal(path.getPath(true), "$foo");
			},

			"should accept simple paths as an Array of one item": function simpleVector() {
				var path = new FieldPath(["foo"]);
				assert.equal(path.getPathLength(), 1);
				assert.equal(path.getFieldName(0), "foo");
				assert.equal(path.getPath(false), "foo");
				assert.equal(path.getPath(true), "$foo");
			},

			"should throw Error if given a '$' String": function dollarSign() {
				assert.throws(function() {
					new FieldPath("$");
				});
			},

			"should throw Error if given a '$'-prefixed String": function dollarSignPrefix() {
				assert.throws(function() {
					new FieldPath("$a");
				});
			},

			"should accept paths as a String with one dot": function dotted() {
				var path = new FieldPath("foo.bar");
				assert.equal(path.getPathLength(), 2);
				assert.equal(path.getFieldName(0), "foo");
				assert.equal(path.getFieldName(1), "bar");
				assert.equal(path.getPath(false), "foo.bar");
				assert.equal(path.getPath(true), "$foo.bar");
			},

			"should throw Error if given a path Array with items containing a dot": function vectorWithDot() {
				assert.throws(function() {
					new FieldPath(["fo.o"]);
				});
			},

			"should accept paths Array of two items": function twoFieldVector() {
				var path = new FieldPath(["foo", "bar"]);
				assert.equal(path.getPathLength(), 2);
				assert.equal(path.getFieldName(0), "foo");
				assert.equal(path.getFieldName(1), "bar");
				assert.equal(path.getPath(false), "foo.bar");
				assert.equal(path.getPath(true), "$foo.bar");
			},

			"should throw Error if given a path String and 2nd field is a '$'-prefixed String": function dollarSignPrefixSecondField() {
				assert.throws(function() {
					new FieldPath("a.$b");
				});
			},

			"should accept path String when it contains two dots": function twoDotted() {
				var path = new FieldPath("foo.bar.baz");
				assert.equal(path.getPathLength(), 3);
				assert.equal(path.getFieldName(0), "foo");
				assert.equal(path.getFieldName(1), "bar");
				assert.equal(path.getFieldName(2), "baz");
				assert.equal(path.getPath(false), "foo.bar.baz");
				assert.equal(path.getPath(true), "$foo.bar.baz");
			},

			"should throw Error if given path String ends in a dot": function terminalDot() {
				assert.throws(function() {
					new FieldPath("foo.");
				});
			},

			"should throw Error if given path String begins in a dot": function prefixDot() {
				assert.throws(function() {
					new FieldPath(".foo");
				});
			},

			"should throw Error if given path String contains adjacent dots": function adjacentDots() {
				assert.throws(function() {
					new FieldPath("foo..bar");
				});
			},

			"should accept path String containing one letter between two dots": function letterBetweenDots() {
				var path = new FieldPath("foo.a.bar");
				assert.equal(path.getPathLength(), 3);
				assert.equal(path.getFieldName(0), "foo");
				assert.equal(path.getFieldName(1), "a");
				assert.equal(path.getFieldName(2), "bar");
				assert.equal(path.getPath(false), "foo.a.bar");
				assert.equal(path.getPath(true), "$foo.a.bar");
			},

			"should throw Error if given path String contains a null character": function nullCharacter() {
				assert.throws(function() {
					new FieldPath("foo.b\0r");
				});
			},

			"should throw Error if given path Array contains an item with a null character": function vectorNullCharacter() {
				assert.throws(function() {
					new FieldPath(["foo", "b\0r"]);
				});
			}

		},

		"#tail()": {

			"should be able to get all but last part of field part of path with 2 fields": function tail() {
				var path = new FieldPath("foo.bar").tail();
				assert.equal(path.getPathLength(), 1);
				assert.equal(path.getPath(), "bar");
			},

			"should be able to get all but last part of field part of path with 3 fields": function tailThreeFields() {
				var path = new FieldPath("foo.bar.baz").tail();
				assert.equal(path.getPathLength(), 2);
				assert.equal(path.getPath(), "bar.baz");
			}

		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run();
