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
const ParseCall = FunctionCall.bind(parse, parser);
const renderer = new (require("./runtime"))({
  "test": "test",
  "up": "down",
  "someone": "no-one"
});
const { render } = renderer;
const RenderCall = FunctionCall.bind(render, renderer);

if (process.argv[3] === "--bench") {
  process.stdout.write("Warming up...");
  for (let i = 0; i < 1e4; i++) {
    ParseCall();
    process.stdout.write(`Warming up... ${i.toLocaleString()}/${(1e4).toLocaleString()}\r`);
  }
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`Warming up... 10,000/10,000 done\nBenchmarking...`);

  let times = [];

  // parse file
  for (let i = 0; i < 50; i++) {
    const date = performance.now(), ast = ParseCall(), _ = RenderCall(ast), newNow = performance.now();
    let time = parseFloat((newNow - date).toFixed(4));
    times.push(time);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Benchmarking... ${i + 1}/50`);
  }

  process.stdout.write(" done\n");
  console.log(`Average time: ${(times.reduce((a, b) => a + b) / times.length).toFixed(4)}ms`);
  console.log(`Best: ${Math.min(...times)}ms; Worst: ${Math.max(...times)}ms`);
  console.log(`Total time: ${times.reduce((a, b) => a + b).toFixed(4)}ms`);

} else {
  // @ts-ignore
  const date = performance.now(), ast = ParseCall(), str = RenderCall(ast), newNow = performance.now(), time = newNow - date;
  console.log(require("util").inspect(ast, false, null, true));
  console.log(str);
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
