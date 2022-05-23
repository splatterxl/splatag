module.exports = class ExpressionParser {
  index = -1;

  /**
   * @param {import(".")} parser
   */
  constructor (parser) {
    this.str = parser.str;
    this.length = parser.length;
    this.parser = parser;
  }

  /**
   * @param {number} i
   * @returns {[import('.').Token[], number]}
   */
  parse(i) {
    this.index = i;
    let token;
    let nodes = [];

    while (token = this.next()) {
      if (token.type === "brace-close") break;

      const [expr, eof] = this.handle(token);

      nodes.push(expr);

      if (eof) break;
    }

    return [nodes, this.index];
  }

  handle(token) {
    let expr = token;

    const next = this.next();

    if (next.type === "brace-close") {
      return [expr, true];
    }

    switch (next.type) {
      case "dot":
        expr = this.matchProperty(expr);
        break;
      case "plus":
        expr = this.matchAdd(expr);
        break;
      case "minus":
        expr = this.matchSub(expr);
        break;
      case "asterisk":
        expr = this.matchMul(expr);
        break;
      case "slash":
        expr = this.matchDiv(expr);
        break;
      case "mod":
        expr = this.matchMod(expr);
        break;
      case "semi":
        break;
      default:
        throw new Error(`Unexpected token: ${next.type}, expected dot, plus, minus, asterisk, slash, mod, or brace-close`);
    }

    return this.handle(expr);
  }

  next() {
    let char = this.str.charAt(this.index++);
    let token;

    if (!char.length) throw new Error("expected token but received eof"); // return { type: "brace-close" }; // throw new Error("Unexpected end of input around " + this.index);

    switch (char) {
      case '@':
        token = this.matchVariable();
        break;
      case ';':
        token = {
          type: "semi",
          value: char
        };
        break;
      case '.':
        token = {
          type: "dot",
          value: char
        };
        break;
      case '{':
        token = {
          type: "brace-open",
          value: char
        };
        break;
      case '}':
        token = {
          type: "brace-close",
          value: char
        };
        break;
      case '+':
        token = {
          type: "plus",
          value: char
        };
        break;
      case '-':
        token = {
          type: "minus",
          value: char
        };
        break;
      case '*':
        token = {
          type: "asterisk",
          value: char
        };
        break;
      case '/':
        token = {
          type: "slash",
          value: char
        };
        break;
      case '%':
        token = {
          type: "mod",
          value: char
        };
        break;
      case '"':
        token = this.matchString();
        break;
      default:
        if (/\s/.test(char)) { break; }
        else if (/[0-9]/.test(char)) {
          token = this.matchNumber(char);
        } else if (/[a-zA-Z]/.test(char)) {
          token = this.matchIdent(char);
        } else {
          throw new Error(
            `Unexpected token: ${char} (index: ${this.index}; code point: U+${char.charCodeAt(0).toString(16).padStart(4, "0")
            })`
          );
        }
        break;
    }

    if (token === undefined) return this.next();

    return this.token = token;
  }

  consume(type) {
    let token = this.next();

    if (token.type !== type) {
      throw new Error(`Expected token ${type}, got ${token.type}`);
    }
    return token;
  }

  matchVariable() {
    return {
      type: "ref",
      value: this.consume("ident").value
    };
  }

  matchNumber(curr) {
    let value = curr + "";
    let dot = false;

    while ((curr = this.str.charAt(this.index)) && /[0-9\.]/.test(curr)) {
      if (curr === "." && dot) throw new Error("Unexpected token: .");
      else if (curr === ".") dot = true;
      value += curr;
      this.index++;
    }

    return {
      type: "number",
      value: parseFloat(value)
    };
  }

  matchIdent(curr) {
    let value = curr + "";

    while ((curr = this.str.charAt(this.index)) && /[a-zA-Z0-9]/.test(curr)) {
      value += curr;
      this.index++;
    }

    return {
      type: "ident",
      value
    };
  }

  matchProperty(parent) {
    let token = this.consumeAny("ident");
    return {
      type: "property",
      value: { parent, property: token.value }
    };
  }

  matchAdd(left) {
    let right = this.consumeAny("number", "ident");
    return {
      type: "add",
      value: { left, right }
    };
  }

  matchSub(left) {
    let right = this.consume("number");
    return {
      type: "sub",
      value: { left, right }
    };
  }

  matchMul(left) {
    let right = this.consumeAny("number", "ident");
    return {
      type: "mul",
      value: { left, right }
    };
  }

  matchDiv(left) {
    let right = this.consume("number");
    return {
      type: "div",
      value: { left, right }
    };
  }

  matchMod(left) {
    let right = this.consume("number");
    return {
      type: "mod",
      value: { left, right }
    };
  }

  matchString() {
    let value = "";
    let curr;

    while ((curr = this.str.charAt(this.index)) && curr !== '"') {
      if (!curr) throw new Error("Unterminated string");
      value += curr;
      this.index++;
    }

    this.index++;

    return {
      type: "string",
      value
    };
  }

  consumeAny(...types) {
    let token = this.next();
    if (!types.includes(token.type)) {
      throw new Error(`Expected token of type ${types.join(", ")} but got ${token.type}`);
    }

    return token;
  }
};
