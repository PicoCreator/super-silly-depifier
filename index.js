const fs = require('fs');
const Parser = require('acorn');

filename = process.argv[2];

js = fs.readFileSync(filename, 'utf-8');
ast = Parser.parse(js);
