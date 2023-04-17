import { languageRunner } from '../generic/languageRunner'
import { hoverProvider } from './providers/hover'
import { parser } from './parser'

export async function runner(state: any, pipeline: any, editor: any, after: any, cacheMap: any, parserOptions: any) {
  return await languageRunner(state, pipeline, editor, parser, after, [hoverProvider], cacheMap, parserOptions)
}
