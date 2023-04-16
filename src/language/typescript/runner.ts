import { languageRunner } from '../generic/languageRunner'
import { hoverProvider } from './providers/hover'
import { parser } from './parser'

export async function runner(state, pipeline, editor, after, cacheMap, parserOptions) {
  return await languageRunner(state, pipeline, editor, parser, after, [hoverProvider], cacheMap, parserOptions)
}
