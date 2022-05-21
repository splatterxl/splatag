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
   * @returns {[string, number]}
   */
  matchBlock(i) {
    this.index = i;
    let token;
    let nodes = [];

    while (token = this.next()) {
      nodes.push(token);
    }

    return [nodes, i];
  }

  next() {
    this.index++;
    let char = this.str.charAt(this.index);
    let token;

    switch (char) {
      case '@':
        let [ident, i] = this.parser.matchIdent(++this.index);
        token = {
          type: 'ref',
          value: ident
        };
        break;
      default:
        throw new Error(`Unexpected character: ${char}`);
    }

    return token;
  }

  matchIdent(i) {
    let buf = "";
    let char;

    while ((char = this.str.charAt(i)) && /[a-zA-Z0-9_]/.test(char)) {
      buf += char;
      i++;
    }

    return [buf, --i];
  }
};