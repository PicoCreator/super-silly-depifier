class astUtil {
	/**
	 * Takes in an ast object/array and parses it to a jsStr array or object
	 * 
	 * @param {Object/Arrray} ast    AST object to parse, or array of ast objects to parse
	 * @param {Array} resArr  [Optional] built array of converted string, initialized if null
	 * 
	 * @return resArr built from the ast
	 */
	static ast_to_jsStrArr(ast, resArr) {
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
}