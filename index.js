const fs = require('fs');
const Parser = require('acorn');

filename = process.argv[2];

js = fs.readFileSync(filename, 'utf-8');
ast = Parser.parse(js);

const astUtil = require("./src/astUtil.js");

//console.log(ast);

function compile(ast, result) {
  return astUtil.ast_to_jsStrArr(ast, result);
}

result = []
compile(ast.body, result)
console.log(result.join(''));
