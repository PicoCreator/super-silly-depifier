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
		it("Literal Int", () => {
			// modCache to use and validate
			let modCache = {}

			// Lets acron pass a literal
			let node = acorn.parse("1")
			assert.ok(node)
			// And get the literal object
			let literalNode = node.body[0].expression
			assert.ok(literalNode)

			// Lets process the definition
			let ret = module_builder.fromAstDefinition(literalNode, modCache).join("")

			// Validate the result
			assert.equal(ret, "require(\"LiteralInt_1\")")
			assert.equal(modCache["LiteralInt_1"], "module.exports = 1");
		});

		//
		// @TODO : boolean ocnversion
		// @TODO : String conversion
		//
	});

	//
	// Binary Expression
	//
	describe('Binary Expression conversion', () => {

		//
		// Basic X+Y
		//
		it("Binary addition", () => {
			// modCache to use and validate
			let modCache = {}

			// Lets acron pass a binary example
			let node = acorn.parse("x+5")
			assert.ok(node)
			// And ge the binary expression
			let binaryNode = node.body[0].expression;
			assert.ok(binaryNode);

			// Lets process the definition
			let ret = module_builder.fromAstDefinition(binaryNode, modCache).join("")

			// Validate the result
			assert.equal(ret, "require(\"x_plus_y\")(x,require(\"LiteralInt_5\"))")
			assert.equal(modCache["x_plus_y"], "module.exports = function(x,y) { return x+y }")
		});
		
	});

});
