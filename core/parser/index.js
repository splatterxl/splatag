module.exports = class Parser {
  constructor() {
    this.index = 0;
  }

  /**
   * @param {string} str
   */
  parse(str = this.str) {
    this.str = str;
    this.length = this.str.length;
    return this.match();
  }

  match() {
    let state = STATES.string;
    let root = { type: 'root', children: [] };
    let current = { type: 'string', value: '' };

    function push() {
      if (current.value?.length === 0) return;

      root.children.push(current);
    }

    function setState(oldState, state) {
      push();
      current = { type: STATES[state], value: '' };
      state &= ~oldState;
      state |= STATES.string;
      console.log(`${STATES[oldState]} (${oldState}) -> ${STATES[state]} ${state}`);
    }

    for (let i = 0; i < this.length; i++) {
      let char = this.str.charAt(i);

      if (state & STATES.string === STATES.string) {

        switch (char) {
          case '$':
            if (this.str.charAt(i + 1) !== "$") {
              setState(STATES.string, STATES.variable);
              this.matchIdent(++i);
              setState(STATES.variable, STATES.string);
            } else {
              i++;
              current.value += char;
            }
            break;
          case '{':
            setState(STATES.string, STATES.expression);
            break;
          default:
            current.value += char;
            break;
        }
      } else if (state & STATES.variable === STATES.variable) {
        if (!/\s/.test(char)) {
          current.value += char;
        } else {
          setState(STATES.variable, STATES.string);
        }
      } else if (state & STATES.expression === STATES.expression) {
        switch (char) {
          case '}':
            setState(STATES.expression, STATES.string);
            break;
          default:
            current.value += char;
            break;
        }
      }
    }

    push();

    return { tree: root.children, errors: [] };
  }
}

const STATES = {
  'string': 1 << 0,
  [1 << 0]: 'string',
  'variable': 1 << 1,
  [1 << 1]: 'variable',
  'expression': 1 << 2,
  [1 << 2]: 'expression'
};

console.log(STATES)
