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
    .replace(new RegExp('\\)', 'g'), 'closebracket')
    .replace(new RegExp('\\[', 'g'), 'opensqbracket')
    .replace(new RegExp('\\]', 'g'), 'closesqbracket')
    .replace(new RegExp('>', 'g'), 'greater')
    .replace(new RegExp('<', 'g'), 'lesser')
    .replace(new RegExp("'", 'g'), '_')
    .replace(new RegExp('"', 'g'), '_');
  let pkgOutput = [];
  compile(ast, pkgOutput, true);
  pkgOutput = [
    "var get = require('get');\n",
    "\n",
    "module.exports = function(context) {\n",
    "  return " + pkgOutput.join('') + ';\n',
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
    } else if (ast.type == "CallExpression") {
      compile(ast.callee, result, pkg);
      result.push('(')
      for (let i=0; i<ast.arguments.length; i++) {
        compile(ast.arguments[i], result, pkg);
        if (i!=ast.arguments.length - 1) {
          result.push(',');
        }
      }
      result.push(')\n')
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
    } else if (ast.type == "FunctionDeclaration") {
      result.push("function ")
      result.push(ast.id.name);
      result.push("(");
      for (let i=0; i<ast.params.length; i++) {
        result.push(ast.params[i].name)
        if (i!=ast.params.length-1) {
          result.push(',')
        }
      }
      result.push(") ");
      
      result.push('{\n');
      result.push("context.unshift({})\n");
      for (let i=0; i<ast.params.length; i++) {
        result.push("get(context, '"+ast.params[i].name+"')."+ast.params[i].name+" = "+ast.params[i].name+";\n");
      }
      result.push("retval = undefined\n\n");
      
      
      compile(ast.body.body, result, pkg);
      result.push('\n}\n');
      
      result.push("get(context, '"+ast.id.name+"')."+ast.id.name+" = "+ast.id.name+";");
      
    } else if (ast.type == "ReturnStatement") {
      result.push('retval = ');
      
      const stmt = [];
      compile(ast.argument, stmt, pkg);
      label = stmtTolabel(ast.argument, stmt);
      console.log('Found:' + label);
      result.push(label + '(context);\n')
      
      result.push("context.shift();\n");
      result.push("return retval;\n");
    } else if (ast.type == "AssignmentExpression") {
      compile(ast.left, result, pkg);
      result.push(' ');
      result.push(ast.operator);
      result.push(' ');
      compile(ast.right, result, pkg);
    } else if (ast.type == "IfStatement") {
      result.push('if (');
      
      const stmt = [];
      compile(ast.test, stmt, pkg);
      label = stmtTolabel(ast.test, stmt);
      console.log('Found:' + label);
      result.push(label + '(context)')
      
      result.push(')\n')
      compile(ast.consequent, result, pkg);
    } else if (ast.type == "WhileStatement") {
      result.push('while (');
      
      const stmt = [];
      compile(ast.test, stmt, pkg);
      label = stmtTolabel(ast.test, stmt);
      console.log('Found:' + label);
      result.push(label + '(context)')
      
      result.push(')\n')
      compile(ast.body, result, pkg);
    } else if (ast.type == "ForStatement") {
      result.push('for (');
      
      let stmt = [];
      compile(ast.init, stmt, pkg);
      label = stmtTolabel(ast.init, stmt);
      console.log('Found:' + label);
      result.push(label + '(context);')
      
      stmt = [];
      compile(ast.test, stmt, pkg);
      label = stmtTolabel(ast.test, stmt);
      console.log('Found:' + label);
      result.push(label + '(context);')
      
      stmt = [];
      compile(ast.update, stmt, pkg);
      label = stmtTolabel(ast.update, stmt);
      console.log('Found:' + label);
      result.push(label + '(context))')
      compile(ast.body, result, pkg);
    } else if (ast.type == "BlockStatement") {
      result.push('{\n');
      compile(ast.body, result, pkg);
      result.push('\n}\n');
    } else if (ast.type == "UpdateExpression") {
      if (ast.prefix) {
        result.push(ast.operator);
        compile(ast.argument, result, pkg);
      } else {
        compile(ast.argument, result, pkg);
        result.push(ast.operator);
      }
    } else if (ast.type == "MemberExpression") {
      if (ast.object.name == "process") {
        result.push('process[')
        compile(ast.property, result, pkg);
        result.push(']')
        return
      } else {
        compile(ast.object, result, pkg);
        result.push('[')
        compile(ast.property, result, pkg);
        result.push(']')
        return
      }
    } else if (ast.type == "NewExpression") {
      result.push('new ')
      result.push(ast.callee.name)
      result.push('(')
      for (let i=0; i<ast.arguments.length; i++) {
        compile(ast.arguments[i], result, true);
        if (i != ast.arguments.length - 1) {
          result.push(',');
        }
      }
      result.push(')')
    } else {
      console.dir(ast);
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





// UPLOADING SHIT
if( process.argv[3] == "true" ) {
  console.log("==============================================");
  console.log("= UPLOADING MODE ENABLED - time to push this!");
  console.log("= you got 0 seconds to terminate this option");
  console.log("==============================================");

  const npmUpload = require("./src/npmUpload.js");
  setTimeout(function() {
    npmUpload.upload_nodeModules("output/node_modules/");
  }, 0);
}
