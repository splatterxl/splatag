const IsError = Symbol("IsError");

module.exports = class Result {
  constructor (ast, error) {
    this.ast = ast ?? [];
    if (error) {
      this[IsError] = true;
      this.error = error;
    }
  }

  *[Symbol.iterator]() {
    yield* this.ast;
  }
};

module.exports.IsError = IsError;