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
 * Given an Identifier node, return as it is (used to build up more complex modules)
 * 
 * @param {acorn ast object} ast node object to walk through
 * @param {module cache} modCache to store completed module code
 * 
 * @return JS usage string
 */
function fromIdentifier(ast, modCache) {
	// Type safety
	if( ast == null || ast.type != 'Identifier' ) {
		throw "Invalid Identifier ast : "+JSON.stringify(ast);
	}
	return [ast.name];
}

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
 * @return JS usage string array
 */
function fromLiteralDefinition(ast, modCache) {
	// Type safety
	if( ast == null || ast.type != 'Literal' ) {
		throw "Invalid Literal ast : "+JSON.stringify(ast);
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
	if( modCache[moduleName] == null ) {
		modCache[moduleName] = `module.exports = ${raw}`;
	}

	// And return the JS representation
	return [`require("${moduleName}")`];
}

/**
 * Given a "BinaryExpression" acorn AST definition, build its package modules (into modCache), 
 * and return its JS usage string.
 * 
 * Examples of binary expression
 * 
 * + `x+y`
 * + `a*b`
 * 
 * @param {acorn ast object} ast node object to walk through
 * @param {module cache} modCache to store completed module code
 * 
 * @return JS usage string
 */
function fromBinaryExpression(ast, modCache) {
	// Type safety
	if( ast == null || ast.type != 'BinaryExpression' ) {
		throw "Invalid BinaryExpression ast : "+JSON.stringify(ast);
	}

	// Process the operator
	let operator = ast.operator;
	let moduleName = null;

	// Handle the appropriate operator module name
	if( operator === "+" ) {
		moduleName = "x_plus_y"
	} else if( operator == "x_minus_y" ) {
		moduleName = "x_minus_y"
	} else if( operator == "x_multiply_y" ) {
		moduleName = "x_multiply_y"
	} else if( operator == "x_division_y" ) {
		moduleName = "x_division_y"
	} else if( operator == "x_modulus_y" ) {
		moduleName = "x_modulus_y"
	}

	// Unknown operator handling
	if( moduleName == null ) {
		throw "Unknown operator type : "+operator;
	}

	// Generate the module
	if( modCache[moduleName] == null ) {
		modCache[moduleName] = `module.exports = function(x,y) { return x${operator}y }`
	}

	// Get the left and right JS string
	let left = fromAstDefinition(ast.left, modCache);
	let right = fromAstDefinition(ast.right, modCache);

	// Using the binary module
	return [`require("${moduleName}")(`].concat(left).concat(",").concat(right).concat(")");
}

/**
 * Given a compatible acorn AST definition, extract various nano modules
 * into the modCache. And return its reduced JS string
 * 
 * @param {acorn ast object} ast node object to walk through
 * @param {module cache} modCache to store completed module code
 * 
 * @return JS usage string
 */
function fromAstDefinition(ast, modCache) {
	// Return object
	let ret = null;

	// AST walking state object
	let state = {};

	// Lets recursively walk the astNode
	walk.recursive(ast, state, {

		// Identifier support, a simple echo
		Identifier(node, st, c) {
			ret = fromIdentifier(node, modCache);
		},

		// Lets make a "Literal" module
		Literal(node, st, c) {
			ret = fromLiteralDefinition(node, modCache);
		},

		// "BinaryExpression" support
		BinaryExpression(node, st, c) {
			ret = fromBinaryExpression(node, modCache);
		}

	});

	// Return the valid result
	if(ret != null) {
		return ret;
	}

	// And return
	throw "Failed to process AstDefintion : "+JSON.stringify(ast);
}


module.exports = {
	fromAstDefinition
};