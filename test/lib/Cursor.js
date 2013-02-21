var assert = require("assert"),
	Cursor = require("../../lib/Cursor");

module.exports = {

	"Cursor": {

		"constructor(data)": {
			"should throw an exception if it does not get a valid array or stream": function(){
				assert.throws(function(){
					var c = new Cursor();
				});
				assert.throws(function(){
					var c = new Cursor(5);
				});
			}
		},

		"#ok": {
			"should return true if there is still data in the array": function(){
				var c = new Cursor([1,2,3,4,5]);
				assert.equal(c.ok(), true);
			},
			"should return false if there is no data left in the array": function(){
				var c = new Cursor([]);
				assert.equal(c.ok(), false);
			},
			"should return true if there is no data left in the array, but there is still a current value": function(){
				var c = new Cursor([1,2]);
				c.advance();
				c.advance();
				assert.equal(c.ok(), true);
				c.advance();
				assert.equal(c.ok(), false);
			}
//			,
//			"should return true if there is still data in the stream": function(){
//				
//			},
//			"should return false if there is no data left in the stream": function(){
//				
//			}

		},
		
		"#advance": {
			"should return true if there is still data in the array": function(){
				var c = new Cursor([1,2,3,4,5]);
				assert.equal(c.advance(), true);
			},
			"should return false if there is no data left in the array": function(){
				var c = new Cursor([1]);
				c.advance();
				assert.equal(c.advance(), false);
			},
			"should update the current object to the next item in the array": function(){
				var c = new Cursor([1,"2"]);
				c.advance();
				assert.strictEqual(c.current(), 1);
				c.advance();
				assert.strictEqual(c.current(), "2");
				c.advance();
				assert.strictEqual(c.current(), undefined);
			}
//,			"should return true if there is still data in the stream": function(){
//				
//			},
//			"should return false if there is no data left in the stream": function(){
//				
//			},
//			"should update the current object to the next item in the stream": function(){
//				
//			}
		},
		
		"#current": {
			"should return the first value if the cursor has not been advanced yet": function(){
				var c = new Cursor([1,2,3,4,5]);
				assert.equal(c.current(), 1);
			},
			"should return the first value if the cursor has been advanced once": function(){
				var c = new Cursor([1,2,3,4,5]);
				c.advance();
				assert.equal(c.current(), 1);
			}
		}

	}

};

if (!module.parent)(new(require("mocha"))()).ui("exports").reporter("spec").addFile(__filename).run();