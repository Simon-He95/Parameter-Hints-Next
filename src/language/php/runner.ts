import { languageRunner } from '../generic/languageRunner'
import { hoverProvider } from './providers/hover'
import { signatureProvider } from './providers/signature'
import { parser } from './parser'

export async function runner(state, pipeline, editor, after, cacheMap) {
  return await languageRunner(state, pipeline, editor, parser, after, cacheMap, [signatureProvider, hoverProvider])
}
