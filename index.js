const fs = require('fs');
const Parser = require('acorn');

filename = process.argv[2];

js = fs.readFileSync(filename, 'utf-8');
ast = Parser.parse(js);

//console.log(ast);



function stmtTolabel(ast, stmt) {
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
    .replace(new RegExp(',', 'g'), 'comma');
  modules[label] = '';
  return label
}

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
      const stmt = []
      compile(ast.expression, stmt);
      stmt.push(';\n');
      label = stmtTolabel(ast, stmt)
      result.push(label + '(context);\n')
    } else if (ast.type == "BinaryExpression") {
      compile(ast.left, result);
      result.push(' ');
      result.push(ast.operator);
      result.push(' ');
      compile(ast.right, result);
    } else if (ast.type == "VariableDeclaration") {
      for (let i=0; i<ast.declarations.length; i++) {
        const stmt = []
        stmt.push(ast.kind);
        stmt.push(' ');
        stmt.push(ast.declarations[i].id.name)
        stmt.push(' = ');
        compile(ast.declarations[i].init, stmt);
        stmt.push(';\n');
        label = stmtTolabel(ast, stmt);
        console.log('Found:' + label);
        result.push(label + '(context);\n')
      }
    } else if (ast.type == "AssignmentExpression") {
      compile(ast.left, result);
      result.push(' ');
      result.push(ast.operator);
      result.push(' ');
      compile(ast.right, result);
    } else {
      throw "NotImplemented " + ast.type;
    }
  }
}

let result = []
const modules = {}

compile(ast.body, result);

const header = [];
header.push("const get = require('get');\n");
for (i in modules) {
  header.push("const " + i + " = require('" + i + "');\n")
}
header.push('\n')
result = header.concat(result);

console.log(result.join(''));

if (!fs.statSync('output')) {
  fs.mkdirSync('output')
}
