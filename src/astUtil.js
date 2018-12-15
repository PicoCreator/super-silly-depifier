/**
 * Static Class: astUtil
 * 
 * Utility library to process ast code and objects
 */

//------------------------------------------
//
// Dependencies
//
//------------------------------------------
const Parser = require('acorn');

//------------------------------------------
//
// Function implementation
//
//------------------------------------------

/**
 * Takes in a js string, and convert it to AST
 * 
 * @param {*} jsStr to parse to ast
 * 
 * @return ast object / ast array
 */
function jsStr_to_ast(jsStr) {
	return Parser.parse(jsStr).body;
}

/**
 * Takes in an AST object, and convert it to JS string array
 * 
 * @param {*} ast object or array (of ast objects) to process
 * @param {*} resArr [Optional] to populate and fill up, initializes as an [] if null
 * 
 * @return resArr converted from the ast
 */
function ast_to_jsStrArr(ast, resArr) {
	// Optional resArr setup
	if( resArr == null ) {
		resArr = [];
	}

	// If ast object is an array, iterate it
	if (Array.isArray(ast)) {
		for (let i=0; i<ast.length; i++) {
		  ast_to_jsStrArr(ast[i], resArr);
		}
		return resArr;
	}

	// Does the various conversion
	if (ast.type == "Literal") {
		resArr.push(ast.raw);
	} else if (ast.type == "Identifier") {
		resArr.push(ast.name);
	} else if (ast.type == "ExpressionStatement") {
		ast_to_jsStrArr(ast.expression, resArr);
	} else if (ast.type == "BinaryExpression") {
		ast_to_jsStrArr(ast.left, resArr);
		resArr.push(' ');
		resArr.push(ast.operator);
		resArr.push(' ');
		ast_to_jsStrArr(ast.right, resArr);
	} else if (ast.type == "VariableDeclaration") {
		for (let i=0; i<ast.declarations.length; i++) {
			resArr.push(ast.kind);
			resArr.push(' ');
			resArr.push(ast.declarations[i].id.name)
			resArr.push(' = ');
			ast_to_jsStrArr(ast.declarations[i].init, resArr);
			resArr.push(';\n');
		}
	} else if (ast.type == "AssignmentExpression") {
		ast_to_jsStrArr(ast.left, resArr);
		resArr.push(' ');
		resArr.push(ast.operator);
		resArr.push(' ');
		ast_to_jsStrArr(ast.right, resArr);
		resArr.push(';\n');
	} else {
		throw "NotImplemented " + ast.type;
	}

	// Return the resArr
	return resArr;
}

//------------------------------------------
//
// Exported "static class"
//
//------------------------------------------
module.exports = {
	ast_to_jsStrArr: ast_to_jsStrArr,
	jsStr_to_ast: jsStr_to_ast
};
