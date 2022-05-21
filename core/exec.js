const process = require("node:process");
const fs = require("node:fs");
const parser = new (require("."))({});

// get 1st arg
const file = process.argv[2];

// read file
const data = fs.readFileSync(file, 'utf8');

const date = Date.now();

// parse file
const ast = parser.parse(data);

console.log(ast);
console.log(`-> ${Date.now() - date}ms`);

// run file
parser.run(ast).then(console.log);
