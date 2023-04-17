import * as ts from 'typescript'
import { dashAst } from '../../lib/walker'

export function parser(text: string, parserOptions: any) {
  try {
    const ast = ts.createSourceFile('test.ts', text.replace(/\n\n/g, '\n '), ts.ScriptTarget.Latest, true, parserOptions.language)
    const nodes: any = {}
    dashAst(ast, (currentNode: any) => {
      try {
        const expression = currentNode.expression
        if (currentNode.escapedText && (currentNode.kind === ts.SyntaxKind.Identifier) && (currentNode.parent.kind === ts.SyntaxKind.VariableDeclaration)) {
          currentNode.start = currentNode.getStart()
          currentNode.end = currentNode.getEnd()
          currentNode.name = currentNode.escapedText
          currentNode.final_end = currentNode.getEnd()
          nodes[currentNode.start] = currentNode
        }
        else
        if (expression && (expression.name || expression.kind === ts.SyntaxKind.Identifier) && (currentNode.kind === ts.SyntaxKind.CallExpression || currentNode.kind === ts.SyntaxKind.NewExpression) && currentNode.arguments && currentNode.arguments.length) {
          if (expression.name) {
            currentNode.start = expression.name.getStart()
            currentNode.end = expression.name.getEnd()
            currentNode.name = expression.name.escapedText
          }
          else {
            currentNode.start = expression.getStart()
            currentNode.end = expression.getEnd()
            currentNode.name = expression.escapedText
          }
          currentNode.final_end = currentNode.arguments[currentNode.arguments.length - 1].getEnd()
          nodes[currentNode.start] = currentNode
        }
      }
      catch (e) {
      }
    })
    return Object.values(nodes)
  }
  catch (e) {
    return []
  }
}
