const { BitField } = require('discord.js');

class PArr extends Array {
  pop() {
    if (this.length === 0) return "";

    return super.pop();
  }
}

function fc(num) {
  num = num.toString().toUpperCase();

  if (num.toString().length !== 6) return "0".repeat(6 - num.toString().length) + num;
  else return num;
}

module.exports = class Parser {
  constructor() {};

  parse(code) { 
    function debug(...args) {
      console.log(...args);
    }

    const chars = code.split('');

    let error;

    const exprs = [];
    const stack = new PArr();
    function ei() {
      return exprs.length - 1;
    }
    function si() {
      return stack.length - 1;
    }

    let state = new BitField(0);

    for (let i = 0; i < chars.length; i++) {
      function handleChar() {
        switch(char) {
          case "$": {
            if (!chars[i + 1]) {
              error = ["LEADING_DOLLAR", "Missing reference closure after dollar sign"];
              break;
            } else if (chars[i + 1] !== "(") { 
              break;
            }

            i++;

            exprs.push({ type: "text", value: stack.pop() });

            debug("Pushed text", exprs[ei()], stack);

            state.add(states.ref);
            break;
          } 
          case "\\": {
            switch (chars[i + 1]) {
              case "\\": 
                stack.push(stack.pop() + "\\");
                i++;
                break;
              case "n":
              case "r":
              case "t":
              case "b":
              case "f":
              case "v":
              case "0": {
                const special = {
                  n: "\n",
                  r: "\r",
                  t: "\t",
                  b: "\b",
                  f: "\f",
                  v: "\v",
                  0: "\0"
                }[chars[i + 1]];

                stack.push(stack.pop() + special);
                i++;

                debug("Pushed special", chars[i + 1], stack[si()]);
                break; 
              }
              case "u": {
                const hex = chars.slice(i + 2, i + 6);

                if (!/[0-9a-fA-F]{4}/gi.test(hex)) {
                  error = ["UNICODE_INVALID", `Invalid unicode escape '\\u${hex}'`];
                  break;
                }

                stack.push(stack.pop() + String.fromCodePoint(parseInt(hex, 16)));

                i += 4;

                debug("Pushed unicode", stack[si()]);
                break;
              }
              case "x": {
                const hex = chars.slice(i + 2, i + 4);

                if (!/[0-9a-fA-F]{2}/gi.test(hex)) {
                  error = ["HEX_INVALID", `Invalid hex escape '\\x${hex}'`];
                  break;
                }

                stack.push(stack.pop() + String.fromCodePoint(parseInt(hex, 16)));

                i += 2;

                debug("Pushed hex", stack[si()]);
                break; 
              }
              default:
                stack.push(stack.pop() + chars[i + 1]);
                i++;

                debug("Pushed escaped", chars[i + 1], stack[si()]);
                break;
            }
          }
          default:
            stack.push(stack.pop() + char);
            break;
        }
      }

      const char = chars[i];

      if (state.has(states.ref)) {
        switch (char) {
          case "\\":
            if (chars[i + 1] === "\\") {
              i++;
              stack.push(stack.pop() + "\\");
            } else {
              if (!/[\.&)$]/gi.test(chars[i + 1])) {
                error = ["INVALID_REFERENCE_ESCAPE", `Invalid escape inside reference: '\\${chars[i + 1]}'`];
                break;
              }

              stack.push(stack.pop() + chars[i + 1]);

              i++;
            }
            break;
          case " ":
            break;
          case ")":
            exprs.push({ type: "ref", value: stack.pop() });
            state.remove(states.ref);

            debug("Pushed ref", exprs[ei()]);
            break;
          case "&":
            exprs.push({ type: "ref", value: stack.pop() });

            debug("Concatenated ref", exprs[ei()]);
            break;
          default:
            if (!/[$a-zA-Z0-9_]/gi.test(char) && char !== '.') {
              error = ["REF_INVALID", `Invalid character U+${fc(char.charCodeAt(0).toString(16))} (${require("util").inspect(char)}) in reference (char ${i})`];
              break
            }
            stack.push(stack.pop() + char);

            break;
        }
      } else if (state.has(states.block)) {
        // todo
      } else if (char === "\n") {
        exprs.push({ type: "text", value: stack.pop() });

        debug("Pushed text", exprs[ei()], stack);
      } else {
        handleChar();
      }
    }
     
    if (error) {
      return { error: error[0], details: error[1] };
    }


    debug(stack, exprs);
    return new Result(exprs);
  };
}

class Result {
  constructor(ast) {
    this.ast = ast;
  }

  applyContext(context) {
    this.context = context;

    return this;
  }

  run() {
    return require('../sandbox').run(this);
  }
}

const states = {
  ref: 1 << 0,
  block: 1 << 1,
}
