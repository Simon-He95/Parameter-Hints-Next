import Engine from 'php-parser'
import { dashAst } from '../../lib/walker.js'

export function parser(text: string) {
  const parser = new Engine({
    parser: {
      extractDoc: true,
      // php7: true,
      suppressErrors: true,
    },
    ast: {
      withPositions: true,
      withSource: true,
    },
  })
  const ast = parser.parseCode(text)
  const nodes: any = {}
  dashAst(ast, (currentNode: any) => {
    if (currentNode.kind === 'call') {
      if (currentNode.what.kind === 'propertylookup' || currentNode.what.kind === 'staticlookup') {
        if (currentNode.arguments.length) {
          const _node: any = {
            what: currentNode.what.offset,
            arguments: currentNode.arguments,
            loc: currentNode.loc,
          }
          _node.start = _node.what.loc.start.offset
          _node.final_end = _node.arguments[_node.arguments.length - 1].loc.end.offset
          nodes[_node.start] = _node
        }
      }
      else {
        if (currentNode.arguments.length) {
          currentNode.start = currentNode.what.loc.start.offset
          currentNode.final_end = currentNode.arguments[currentNode.arguments.length - 1].loc.end.offset
          nodes[currentNode.start] = currentNode
        }
      }
    }
    else if (currentNode.kind === 'new') {
      if (currentNode.arguments.length) {
        currentNode.start = currentNode.what.loc.start.offset
        currentNode.final_end = currentNode.arguments[currentNode.arguments.length - 1].loc.end.offset
        nodes[currentNode.start] = currentNode
      }
    }
  })

  return Object.values(nodes)
}
