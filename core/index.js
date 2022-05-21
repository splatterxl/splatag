const Parser = require('./parser');

module.exports = class {
  constructor(options) {
    this.parser = new Parser(options);
  }

  parse(data) {
    return this.parser.parse(data);
  }
}
