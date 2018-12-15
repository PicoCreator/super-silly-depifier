const fs = require('fs');
const Parser = require('acorn');

const astUtil = require('./src/astUtil.js')


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
  return astUtil.ast_to_jsStrArr(ast, result);
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
