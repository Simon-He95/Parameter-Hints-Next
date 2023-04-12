const { getPositionOfFrom } = require('../../lib/getPositionOfFrom')
const { promiseList } = require('../../lib/promiseList')
const HintList = require('./hintList')

module.exports = async (state, pipeline, editor, parser, after, providers, cacheMap, parserOptions = {}) => {
  const text = editor.document.getText()
  const positionOf = getPositionOfFrom(editor)
  let nodes = parser(text, parserOptions)
  let cacheHints = []
  if (cacheMap.size)
    [nodes, cacheHints] = getCacheNode(nodes, positionOf, cacheMap)

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

        cacheMap.set(generateKey(node), provider.map(hint => hintList.getHint(hint)))
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
  let hints = cacheHints.concat(nodes.length ? await runner() : [])
  let count = 0
  if (!state.done)
    after(hints)

  while (hints.length === 0 && count < 3 && !state.done && nodes.length) {
    // eslint-disable-next-line promise/param-names
    await new Promise(r => setTimeout(r, 2000))
    if (!state.done) {
      hints = cacheHints.concat(await runner())
      if (!state.done)
        after(hints)
    }
    count++
  }
  if (!hints || hints.length === 0)
    return []

  if (!state.done)
    after(hints)

  return hints
}

function generateKey(node) {
  const { name, pos, kind, start, end, final_end } = node
  return [name, pos, kind, start, end, final_end].join(';')
}

function getCacheNode(nodes, positionOf, cacheMap) {
  const result = []
  const nocacheMap = nodes.filter((node) => {
    const key = generateKey(node)
    if (!cacheMap.has(key))
      return true
    const cacheHints = cacheMap.get(key)
    result.push(...cacheHints)
    return false
  })
  return [nocacheMap, result]
}
