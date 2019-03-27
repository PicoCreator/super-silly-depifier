const acorn = require("acorn");
const walk = require("acorn-walk");
const md5 = require("md5");

//------------------------------------------------------------------------
//
//  Definition processing functions
// 
//  Used to format a specific subset of acorn definitions,
//  directly into modules, and usage statements.
//
//------------------------------------------------------------------------

/**
 * Given a "Literal" acorn AST definition, build its package modules (into modCache), 
 * and return its JS usage string.
 * 
 * Examples of literal definition
 * 
 * + `199`
 * + `true`
 * + `"hello world"`
 * 
 * @param {acorn ast object} ast node object to walk through
 * @param {module cache} modCache to store completed module code
 * 
 * @return JS usage string
 */
function fromLiteralDefinition(ast, modCache) {
	// Type safety
	if( ast == null || ast.type != 'Literal' ) {
		throw "Invalid Literal ast : "+ast;
	}

	// Get the values we need
	const value = ast.value;
	const raw = ast.raw;

	// ModuleName to generate for the literal
	let moduleName = null;

	// And process the literal values according to their type
	// and generate the moduleName
	if( Number.isInteger(value) ) {
		// INT type support
		moduleName = "LiteralInt_"+value;
	} else if( value === true || value === false ) {
		// BOOLEAN type support
		moduleName = "LiteralBool_"+value;
	} else if( typeof value === "string" ) {
		// STRING type support
		moduleName = "LiteralStr_"+md5(value)+"_"+value.length;
	} else {
		// All other literal object fallbacks
		let valueStr = value.toString();
		moduleName = "Literal_"+md5(valueStr)+"_"+valueStr.length;
	}

	// Setup the mod cache
	modCache[moduleName] = `module.exports = ${raw}`;

	// And return the JS representation
	return `require("${moduleName}")`;
}

/**
 * Given a compatible acorn AST definition
 * rebuilds it as a "package" object, along with its usage statement.
 * 
 * This is not meant to be used directly. As it supports a strict subset of the list of definitions, such as
 * 
 * + Literal
 * + BinaryExpression
 * + LogicalExpression
 * 
 * And will terminate and immediately on any of the above statements
 * 
 * @param {acorn ast object} ast node object to walk through
 * @param {module cache} modCache to store completed module code
 * 
 * @return JS usage string
 */
function fromNanoDefinition(ast, modCache) {
	// Return object
	let ret = null;

	// AST walking state object
	let state = {};

	// Lets recursively walk the astNode
	walk.recursive(ast, state, {

		// Lets make a "Literal" module
		Literal(node, st, c) {
			ret = fromLiteralDefinition(node, modCache);
		}
	});

	// And return
	return ret;
}


module.exports = {
	fromNanoDefinition
};