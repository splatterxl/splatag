const Parser = require('./parser');
const Renderer = require('./runtime');

module.exports = class splatag {
  constructor (options) {
    this.parser = new Parser(options);
    this.renderer = new Renderer(options.context);
  }

  parse(data) {
    return this.parser.parse(data);
  }

  render(ast) {
    return this.renderer.render(ast);
  }

  run(data) {
    return this.render(this.parse(data));
  }
};
