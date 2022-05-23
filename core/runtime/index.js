const Result = require('../parser/result.js');

module.exports = class Runtime {
  __variableStore = new Map();

  constructor (context) {
    if (context instanceof Map === false) {
      this.context = new Map(Object.entries(context));
    } else {
      this.context = context;
    }
  }

  /**
   * @param {Result} ast
   */
  render(ast, discordStyle = false) {
    if (ast[Result.IsError]) {
      return ast.error.message;
    }

    let buf = "";

    for (let token of ast) {
      switch (token.type) {
        case "string":
          buf += token.value;
          break;
        case "variable":
          buf += this.renderVariable(token.value);
          break;
        case "expression":
          buf += this.renderExpression(token.value, discordStyle);
          break;
      }
    }

    return buf;
  }

  renderVariable(name) {
    if (this.__variableStore.has(name)) {
      return this.__variableStore.get(name);
    }

    if (this.context.has(name)) {
      return this.context.get(name);
    }

    return `[${name} not defined]`;
  }

  renderExpression(expr, discordStyle = false) {
    return "[[ expressions not supported ]]";
  }
};