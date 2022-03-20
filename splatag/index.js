module.exports = function(code, context, parser) {
  return parser.parse(code).applyContext(context).check().run();
}
