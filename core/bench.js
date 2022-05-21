const process = require("node:process");
const fs = require("node:fs");
const { performance } = require('node:perf_hooks');

// get 1st arg
const file = process.argv[2];

// read file
const data = fs.readFileSync(file, 'utf8');
const parser = new (require("./parser"))(data);
const { parse } = parser;
let { call: FunctionCall } = Function;
FunctionCall = FunctionCall.bind(parse);

if (process.argv[3] === "--bench") {

  for (let i = 0; i < 10000; i++) {
    FunctionCall(parser);
  }

  // parse file
  for (let i = 0; i < 10; i++) {
    const date = performance.now(), ast = FunctionCall(parser), newNow = performance.now();
    console.log(`-> ${newNow - date}ms`);
  }
} else {
  const date = performance.now(), ast = FunctionCall(parser), newNow = performance.now(), time = newNow - date;
  console.log(require("util").inspect(ast, false, null, true));
  console.log(`-> ${deepLength(ast)} nodes; ${time}ms`);
}

// run file
// parser.run(ast).then(console.log);

/**
 * Recursively traverse AST and return the amount of nodes
 * @param {Array} arr 
 */
function deepLength(arr) {
  let i = 0;
  for (let node of arr) {
    if (Array.isArray(node.value)) {
      i += deepLength(node.value);
    } else {
      i++;
    }
  }
  return i;
}