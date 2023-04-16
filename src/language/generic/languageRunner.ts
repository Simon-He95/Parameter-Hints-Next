import { getPositionOfFrom } from '../../lib/getPositionOfFrom'
import { promiseList } from '../../lib/promiseList'
import { HintList } from './hintList'

export async function languageRunner(state, pipeline, editor, parser, after, providers, cacheMap, parserOptions = {}) {
  const text = editor.document.getText()
  const positionOf = getPositionOfFrom(editor)
  const nodes = parser(text, parserOptions)

  const runner = async () => {
    const hintList = new HintList(positionOf, editor)
    const promises = promiseList()
    for (const node of nodes) {
      if (!hintList.nodeVisible(node))
        continue
      const pipes = pipeline(async () => {
        const provider = await providers[0](editor, node, positionOf)
        if (!provider || !provider.length)
          return false

        provider.forEach(hint => hintList.addHint(hint))
        return true
      })
      for (let i = 1; i < providers.length; i++) {
        pipes.pipe(
          async () => {
            const provider = await providers[i](editor, node, positionOf)
            if (!provider || !provider.length)
              return false
            provider.forEach(hint => hintList.addHint(hint))
            return true
          },
        )
      }
      pipes.pipe(() => true)

      promises.push(pipes)
    }
    await promises.done()

    return hintList.getHints()
  }
  let hints = await runner()
  let count = 0
  if (!state.done)
    after(hints, editor)

  while (hints.length === 0 && count < 3 && !state.done && nodes.length) {
    // eslint-disable-next-line promise/param-names
    await new Promise(r => setTimeout(r, 2000))
    if (!state.done) {
      hints = await runner()
      if (!state.done)
        after(hints, editor)
    }
    count++
  }
  if (!hints || hints.length === 0)
    return []

  if (!state.done)
    after(hints, editor)

  return hints
}
