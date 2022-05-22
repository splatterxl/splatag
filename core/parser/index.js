const ExpressionParser = require('./expression.js');

module.exports = class Parser {
  constructor (str = "") {
    this.str = str;
    this.length = this.str.length;
    this.index = 0;
    this.expression = new ExpressionParser(this);
  }

  parse() {
    return this.match();
  }

  match() {
    let state = STATES.string;
    /**
     * @type {Array<{ type: string; value: any }>}
     */
    let ast = [];
    let currentType = "string";
    let currentValue = "";

    function push() {
      if (currentValue?.length === 0) return;

      ast.push({
        type: currentType,
        value: currentValue
      });
    }

    function setState(oldState, newState) {
      push();
      currentType = STATES[newState];
      currentValue = "";
      state &= ~oldState;
      state |= newState;
    }

    for (let i = 0; i < this.length; i++) {
      let char = this.str.charAt(i);

      if ((state & STATES.string) === STATES.string) {
        switch (char) {
          case '$':
            if (this.str.charAt(i + 1) !== "$") {
              setState(STATES.string, STATES.variable);
              let [c, ind] = this.matchIdent(++i);
              i = ind;
              currentValue += c;
              setState(STATES.variable, STATES.string);
            } else {
              i++;
              currentValue += "{";
            }
            break;
          case '{':
            if (this.str.charAt(i + 1) !== ".".toString()) {
              setState(STATES.string, STATES.expression);
              let [exprAst, ind] = this.expression.parse(++i);
              i = ind;
              currentValue = exprAst;
              setState(STATES.expression, STATES.string);
            } else {
              i++;
              currentValue += char;
            }
            break;
          default:
            currentValue += char;
            break;
        }
      } else if ((state & STATES.variable) === STATES.variable) {
        if (!/\s/.test(char)) {
          currentValue += char;
        } else {
          setState(STATES.variable, STATES.string);
        }
      }
    }

    push();

    return ast;
  }

  /**
   * @param {number} startIndex
   */
  matchIdent(startIndex) {
    let buf = "";
    let char;
    let i = startIndex;

    while ((char = this.str.charAt(i)) && /[a-zA-Z0-9_]/.test(char)) {
      buf += char;
      i++;
    }

    return [buf, --i];
  }
};

const STATES = {
  'string': 1 << 0,
  [1 << 0]: 'string',
  'variable': 1 << 1,
  [1 << 1]: 'variable',
  'expression': 1 << 2,
  [1 << 2]: 'expression'
};
