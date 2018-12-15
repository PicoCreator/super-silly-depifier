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
    .replace(new RegExp(',', 'g'), 'comma')
    .replace(new RegExp('\\.', 'g'), 'dot')
    .replace(new RegExp('\\(', 'g'), 'openbracket')
    .replace(new RegExp('\\)', 'g'), 'closebracket');
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


function compile(ast, result, pkg) {
  if (pkg == "undefined") {
    pkg = false;
  }
  
  if (Array.isArray(ast)) {
    for (let i=0; i<ast.length; i++) {
      compile(ast[i], result, pkg);
    }
  } else {
    if (ast.type == "Literal") {
      result.push(ast.raw);
    } else if (ast.type == "Identifier") {
      if (pkg) {
        result.push("get(context, '"+ast.name+"')."+ast.name+"");
      } else {
        result.push(ast.name);
      }
    } else if (ast.type == "ExpressionStatement") {
      if (ast.expression.type == "CallExpression") {
        const funcName = js.slice(ast.expression.callee.start, ast.expression.callee.end);
        
        if (funcName == 'console.log') {
          result.push(funcName + '(');
          for (let i=0; i<ast.expression.arguments.length; i++) {
            compile(ast.expression.arguments[i], result, true);
            if (i != ast.expression.arguments.length - 1) {
              result.push(',');
            }
          }
          result.push(')');
        }
        return;
      }
      
      const stmt = []
      compile(ast.expression, stmt, pkg);
      stmt.push(';\n');
      
      if (pkg) {
        result.push(stmt.join(''));
      } else {
        label = stmtTolabel(ast, stmt);
        result.push(label + '(context);\n');
      }
    } else if (ast.type == "BinaryExpression") {
      compile(ast.left, result, pkg);
      result.push(' ');
      result.push(ast.operator);
      result.push(' ');
      compile(ast.right, result, pkg);
    } else if (ast.type == "VariableDeclaration") {
      for (let i=0; i<ast.declarations.length; i++) {
        if (pkg) {
          const stmt = []
          result.push("get(context, '"+ast.declarations[i].id.name+"')."+ast.declarations[i].id.name+"");
          stmt.push(' = ');
          compile(ast.declarations[i].init, stmt, pkg);
          stmt.push(';\n');
          result.push(stmt.join(''));
        } else {
          const stmt = []
          stmt.push(ast.kind);
          stmt.push(' ');
          stmt.push(ast.declarations[i].id.name)
          stmt.push(' = ');
          compile(ast.declarations[i].init, stmt, pkg);
          stmt.push(';\n');
          label = stmtTolabel(ast, stmt);
          console.log('Found:' + label);
          result.push(label + '(context);\n')
        }
      }
    } else if (ast.type == "AssignmentExpression") {
      compile(ast.left, result, pkg);
      result.push(' ');
      result.push(ast.operator);
      result.push(' ');
      compile(ast.right, result, pkg);
    } else if (ast.type == "CallExpression") {
      
      // throw "NotImplemented " + ast.type;
    } else {
      throw "NotImplemented " + ast.type;
    }
  }
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
