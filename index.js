const fs = require('fs');
const Parser = require('acorn');

filename = process.argv[2];

js = fs.readFileSync(filename, 'utf-8');
ast = Parser.parse(js);

console.log(ast);

function compile(ast, result) {
  if (Array.isArray(ast)) {
    for (let i=0; i<ast.length; i++) {
      compile(ast[i], result);
    }
  } else {
    if (ast.type == "Literal") {
      result.push(ast.raw);
    } else if (ast.type == "Identifier") {
      result.push(ast.name);
    } else if (ast.type == "ExpressionStatement") {
      compile(ast.expression, result);
    } else if (ast.type == "BinaryExpression") {
      compile(ast.left, result);
      result.push(' ');
      result.push(ast.operator);
      result.push(' ');
      compile(ast.right, result);
    } else if (ast.type == "VariableDeclaration") {
      for (let i=0; i<ast.declarations.length; i++) {
        result.push(ast.kind);
        result.push(' ');
        result.push(ast.declarations[i].id.name)
        result.push(' = ');
        compile(ast.declarations[i].init, result);
        result.push(';\n');
      }
    } else if (ast.type == "AssignmentExpression") {
      compile(ast.left, result);
      result.push(' ');
      result.push(ast.operator);
      result.push(' ');
      compile(ast.right, result);
      result.push(';\n');
    } else {
      throw "NotImplemented " + ast.type;
    }
  }
}

result = []
compile(ast.body, result)
console.log(result.join(''));
