const assert = require('assert');
const astUtil = require("./../src/astUtil.js");


describe('astUtil test suite', function() {
	describe('jsStr_to_ast_to_jsStr (simple_math_sample)', function() {

		// simple_math_sample
		const simple_math_sample = [
			"const y = 2;",
			"var x = 1 + y;",
			"x += 2;",
			"x = x + 3;"
		];

		it('parse : one line js parsing', function() {
			for(let i=0; i<simple_math_sample.length; ++i) {
				assert.equal(
					astUtil.ast_to_jsStrArr( astUtil.jsStr_to_ast(simple_math_sample[i]) ).join("").trim(),
					simple_math_sample[i].trim()
				);
			}
		});

		it('parse : multiline js parsing', function() {
			assert.equal(
				astUtil.ast_to_jsStrArr( astUtil.jsStr_to_ast(simple_math_sample.join("\n")) ).join("").trim(),
				simple_math_sample.join("\n").trim()
			);
		});
	});
});