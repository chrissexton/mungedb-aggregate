"use strict";
var assert = require("assert"),
	Document = require("../../../lib/pipeline/Document");


module.exports = {

	"Document": {

		"compare 2 Documents": {

			"should return 0 if Documents are identical": function compareDocumentsIdentical() {
				var lDocument = {"prop1": 0},
					rDocument = {"prop1": 0},
					result = Document.compare(lDocument, rDocument);
				assert.equal(result, 0);
			},

			"should return -1 if left Document is shorter": function compareLeftDocumentShorter() {
				var lDocument = {"prop1": 0},
					rDocument = {"prop1": 0, "prop2": 0},
					result = Document.compare(lDocument, rDocument);
				assert.equal(result, -1);
			},

			"should return 1 if right Document is shorter": function compareRightDocumentShorter() {
				var lDocument = {"prop1": 0, "prop2": 0},
					rDocument = {"prop1": 0},
					result = Document.compare(lDocument, rDocument);
				assert.equal(result, 1);
			},

			"should return nameCmp result -1 if left Document field value is less": function compareLeftDocumentFieldLess() {
				var lDocument = {"prop1": 0},
					rDocument = {"prop1": 1},
					result = Document.compare(lDocument, rDocument);
				assert.equal(result, -1);
			},

			"should return nameCmp result 1 if right Document field value is less": function compareRightDocumentFieldLess() {
				var lDocument = {"prop1": 1},
					rDocument = {"prop1": 0},
					result = Document.compare(lDocument, rDocument);
				assert.equal(result, 1);
			}
		},

		"clone a Document": {

			"should return same field and value from cloned Document ": function clonedDocumentSingleFieldValue() {
				var doc = {"prop1": 17},
					res = Document.clone(doc);
				assert(res instanceof Object);
				assert.deepEqual(doc, res);
				assert.equal(res.prop1, 17);
			},

			"should return same fields and values from cloned Document ": function clonedDocumentMultiFieldValue() {
				var doc = {"prop1": 17, "prop2": "a string"},
					res = Document.clone(doc);
				assert.deepEqual(doc, res);
				assert(res instanceof Object);
				assert.equal(res.prop1, 17);
				assert.equal(res.prop2, "a string");
			}
		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run();
