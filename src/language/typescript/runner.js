const languageRunner = require('../generic/languageRunner')
const { hoverProvider } = require('./providers/hover')
const { parser } = require('./parser')

module.exports.runner = async function runner(state, pipeline, editor, after, parserOptions) {
  return await languageRunner(state, pipeline, editor, parser, after, [hoverProvider], parserOptions)
}
