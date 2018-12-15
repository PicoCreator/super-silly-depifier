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

	// Does the various conversion types
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

 
function crazy_stmtTolabel(ast, stmt, CContext) {
	const label = stmt.join('')
		.replace(new RegExp(' ', 'g'), '_')
		.replace(new RegExp(';', 'g'), '')
		.replace(new RegExp('\n', 'g'), '')
		.replace(new RegExp('=', 'g'), 'equals')
		.replace(new RegExp('\\+', 'g'), 'plus')
		.replace(new RegExp('-', 'g'), 'minus')
		.replace(new RegExp('\\*', 'g'), 'times')
		.replace(new RegExp('/', 'g'), 'divide')
		.replace(new RegExp('%', 'g'), 'percent')
		.replace(new RegExp(',', 'g'), 'comma')
		.replace(new RegExp('\\.', 'g'), 'dot')
		.replace(new RegExp('\\(', 'g'), 'openbracket')
		.replace(new RegExp('\\)', 'g'), 'closebracket');
	let pkgOutput = [];
	let stmtContext = Object.assign({}, CContext, { isPkg:true });
	crazy_ast_shit(ast, stmtContext, pkgOutput);
	pkgOutput = [
		"var get = require('get');\n",
		"\n",
		"module.exports = function(context) {\n",
		pkgOutput.join(''),
		"}\n",
	];

	console.log("PKG: " + pkgOutput.join(''));
	CContext.modules[label] = pkgOutput;
	return label
}


/**
 * @TODO - refactor this hsit
 * 
 * @param {*} ast object or array (of ast objects) to process
 * @param {*} CContext object for the compiler state
 * @param {*} result to populate and fill up
 */
function crazy_ast_shit(ast, CContext, result) {
	if (CContext.isPkg == "undefined") {
	  CContext.isPkg = false;
	}
	
	if(!Array.isArray(result)) {
		throw "invalid result array";
	}

	if (Array.isArray(ast)) {
	  for (let i=0; i<ast.length; i++) {
		 crazy_ast_shit(ast[i], CContext, result);
	  }
	  return result;
	} 

	if (ast.type == "Literal") {
		result.push(ast.raw);
	 } else if (ast.type == "Identifier") {
		if (CContext.isPkg) {
		  result.push("get(context, '"+ast.name+"')."+ast.name+"");
		} else {
		  result.push(ast.name);
		}
	 } else if (ast.type == "ExpressionStatement") {
		if (ast.expression.type == "CallExpression") {
		  const funcName = CContext.oriJs.slice(ast.expression.callee.start, ast.expression.callee.end);
		  
		  if (funcName == 'console.log') {
			 result.push(funcName + '(');
			 for (let i=0; i<ast.expression.arguments.length; i++) {
				crazy_ast_shit(ast.expression.arguments[i], result, true);
				if (i != ast.expression.arguments.length - 1) {
				  result.push(',');
				}
			 }
			 result.push(')');
		  }
		  return;
		}
		
		const stmt = []
		crazy_ast_shit(ast.expression, CContext, stmt);
		stmt.push(';\n');
		
		if (CContext.isPkg) {
		  result.push(stmt.join(''));
		} else {
		  label = crazy_stmtTolabel(ast, stmt, CContext);
		  result.push(label + '(context);\n');
		}
	 } else if (ast.type == "BinaryExpression") {
		crazy_ast_shit(ast.left, CContext, result);
		result.push(' ');
		result.push(ast.operator);
		result.push(' ');
		crazy_ast_shit(ast.right, CContext, result);
	 } else if (ast.type == "VariableDeclaration") {
		for (let i=0; i<ast.declarations.length; i++) {
		  if (CContext.isPkg) {
			 const stmt = []
			 result.push("get(context, '"+ast.declarations[i].id.name+"')."+ast.declarations[i].id.name+"");
			 stmt.push(' = ');
			 crazy_ast_shit(ast.declarations[i].init, CContext, stmt);
			 stmt.push(';\n');
			 result.push(stmt.join(''));
		  } else {
			 const stmt = []
			 stmt.push(ast.kind);
			 stmt.push(' ');
			 stmt.push(ast.declarations[i].id.name)
			 stmt.push(' = ');
			 crazy_ast_shit(ast.declarations[i].init, CContext, stmt);
			 stmt.push(';\n');
			 label = crazy_stmtTolabel(ast, stmt, CContext);
			 console.log('Found:' + label);
			 result.push(label + '(context);\n')
		  }
		}
	 } else if (ast.type == "AssignmentExpression") {
		crazy_ast_shit(ast.left, CContext, result);
		result.push(' ');
		result.push(ast.operator);
		result.push(' ');
		crazy_ast_shit(ast.right, CContext, result);
	 } else if (ast.type == "CallExpression") {
		
		// throw "NotImplemented " + ast.type;
	 } else {
		throw "NotImplemented " + ast.type;
	 }
 }

//------------------------------------------
//
// Exported "static class"
//
//------------------------------------------
module.exports = {
	ast_to_jsStrArr: ast_to_jsStrArr,
	jsStr_to_ast: jsStr_to_ast,
	crazy_ast_shit: crazy_ast_shit
};
