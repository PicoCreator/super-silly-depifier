const assert = require('assert');

const acorn = require("acorn");
const walk = require("acorn-walk");
const module_builder = require("../src/module_builder");

describe('ast to module test', () => {

	//
	// Literal definition conversion
	//
	describe('Literal Definition conversion', () => {

		//
		// Test int parsing and conversion
		//
		it("Int conversion", () => {
			// modCache to use and validate
			let modCache = {};

			// Lets acron pass a literal
			let node = acorn.parse("1")
			assert.ok(node)
			// And get the literal object
			let literalNode = node.body[0].expression
			assert.ok(literalNode)

			// Lets process the definition
			let ret = module_builder.fromNanoDefinition(literalNode, modCache)

			// Validate the result
			assert.equal(ret, "require(\"LiteralInt_1\")")
			assert.equal(modCache["LiteralInt_1"], "module.exports = 1");
		});

		//
		// @TODO : boolean ocnversion
		// @TODO : String conversion
		//
	});

});



			// console.log("------------------")
			// let ast = acorn.parse("let x = x+1");
			// console.log(ast);
			// console.log("------------------")
			// let astDeclare = ast.body[0].declarations[0];
			// console.log(astDeclare);
			// console.log("------------------")
			// console.log( module_builder.fromNanoDefinition( astDeclare.init.right ) );
			// assert.ok(ast);