const fs = require('fs');
const path = require('path');

const Parser = require('acorn');

filename = process.argv[2];
basename = path.basename(filename);

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
  let pkgOutput = [];
  compile(ast, pkgOutput, true);
  pkgOutput = [
    "var get = require('get');\n",
    "\n",
    "module.exports = function(context) {\n",
    pkgOutput.join(''),
    "}\n",
  ];
  
  console.log("PKG: " + pkgOutput.join(''));
  modules[label] = pkgOutput;
  return label
}

function compile(ast, result, pkg) {
  astUtil.crazy_ast_shit(ast, {
    isPkg : pkg,
    oriJs : js
  }, result);
}

function compile_fuzz(ast, result, pkg) {
  // Array iterate
  if (Array.isArray(ast)) {
    for (let i=0; i<ast.length; i++) {
      compile_fuzz(ast[i], result, pkg);
    }
    return result;
  }

  // NEW STUFF
  if (ast.type == "Literal") {

  }

  // old stuff
  return compile(ast, result, pkg);
}

let result = [];
const modules = {};

compile(ast.body, result);

const header = [];
header.push("const get = require('get');\n");
for (i in modules) {
  header.push("const " + i + " = require('" + i + "');\n");
}
header.push('\n');
header.push('const context = [{}];\n');
header.push('\n');
result = header.concat(result);

console.log(result.join(''));
if (!fs.existsSync('output')) {
  fs.mkdirSync('output');
}
fs.writeFileSync("output/"+basename, result.join(''));

if (!fs.existsSync('output/node_modules')) {
  fs.mkdirSync('output/node_modules');
}

const getString = [
  "module.exports = function(context, variable) {\n",
  "    for (var i=0; i<context.length; i++) {\n",
  "        if (context[i].hasOwnProperty(variable)) {\n",
  "            return context[i];\n",
  "        }\n",
  "    }\n",
  "    return context[0];\n",
  "}\n"
]

if (!fs.existsSync('output/node_modules/get/')) {
  fs.mkdirSync('output/node_modules/get/');
}
console.log("WRITING: output/node_modules/get/index.js");
fs.writeFileSync("output/node_modules/get/index.js", getString.join(''));


for (i in modules) {
  if (!fs.existsSync('output/node_modules/' + i)) {
    fs.mkdirSync('output/node_modules/' + i );
  }
  
  console.log("WRITING: output/node_modules/" + i + "/index.js");
  fs.writeFileSync("output/node_modules/" + i + "/index.js", modules[i].join(''));
}
