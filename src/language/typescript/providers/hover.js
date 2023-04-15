const vscode = require('vscode')
const ts = require('typescript')
const { hoverProvider } = require('../../generic/providers')

module.exports.hoverProvider = async (editor, node, positionOf) => {
  const nodePosition = positionOf(node.start)
  const hoverCommand = await hoverProvider(editor, nodePosition)
  const command = hoverCommand[0]
  if (command && command.contents && command.contents.length > 0) {
    // get typescript type
    const mode = vscode.workspace.getConfiguration('parameterHints').get('hintingType')
    const parsingString = getTypescriptType(hoverCommand)
    if (!parsingString)
      return false

    let preparse = parsingString.trim()
      .replace(/^var(.*?):\s*(.*?)(\s*new\s*.*?\(|\()(.*)/s, '(method) a$2($4')
      .replace(/^constructor\s*([a-zA-Z0-9]+)\s*\(/s, '(method) a$1(')
      .replace(/^const(.*?):\s*(.*?)(\s*new\s*.*?\(|\()(.*)/s, '(method) a$2($4')
      .replace(/^let(.*?):\s*(.*?)(\s*new\s*.*?\(|\()(.*)/s, '(method) a$2($4')
      .replace(/\(method\)(([^(]*?)\.|\s*)([a-z_A-Z0-9]+)(\s*\(|\s*<)/s, '(method) function $3$4')
      .replace(/\(alias\)((.*?)\.|\s*)([a-z_A-Z0-9]+)(\s*\(|\s*<)/s, '(method) function $3$4')
      .replace(/function (([^(]*?)\.|\s*)([a-z_A-Z0-9]+)(\s*\(|\s*<)/s, '(method) function $3$4')
      .replace(/function\s*([a-zA-Z_0-9]+\.)([a-z_A-Z0-9]+)/s, 'function $2')
      .replace(/\(method\)\s*function\s*([a-z_A-Z0-9]+)\s*<(.*?)>\(/s, '(method) function $1(')

    while (/^\(method\) /.test(preparse))
      preparse = preparse.replace(/^\(method\) /, '')

    const replacethreepoint = '__点点点__'
    preparse = preparse.replace(/<(.*?)>(,|\)|\s*\|)/g, '$2')
      .replace(/\w+<...>/g, v => v.replace(/.../g, replacethreepoint))
      .replace(/_[^:]+:\s*\w+[;]/g, '') // 过滤私有属性
      .replace(/\[Symbol\.[^:]+:\s*\w+[;]/g, '') // 过滤[Symbol.iterator]
      .replace(/[\&\|]\s*{[\n\s]*}/g, '') // 过滤空的{}
      .replace(/{[\n\s]*\[Symbol\.((replace)|(match))\][^;]+;\n}/, 'String | RegExp')
      .replace(/[\s\n]*([{}])[\n\s]*/g, '$1')
    const parsed = ts.createSourceFile('inline.ts', preparse, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const statement = parsed.statements[0]
    if (statement.kind === ts.SyntaxKind.VariableStatement) {
      // VariableStatement
      const match = preparse.match(/:([\s\n\w\{\}\?;\:\<\>\[\]\|,\(\)=\."'_\\\?\$\u4E00-\u9FA5]*)/)
      if (!match)
        return false
      // 将() =>xx 简化成Function
      const label = `:${match[1]
        .replace(/\s*\n\s*/g, '')
        .trim()
        .replace(/;}/g, '}').replaceAll(replacethreepoint, '...')}`
      return [
        {
          label,
          start: node.end,
          end: node.end,
        },
      ]
    }
    const subparams = statement.parameters
    if (!subparams)
      return false

    const params = []
    let variadicLabel = ''
    let variadicCounter = 0

    for (let i = 0; i < node.arguments.length; i++) {
      let label
      if (variadicLabel) {
        if (mode === 'typeOnly')
          label = variadicLabel
        else
          label = `${variadicLabel}[${variadicCounter}]`

        variadicCounter++
      }
      else if (subparams.length <= i) {
        break
      }
      if (!label) {
        let variadic = false
        if (subparams[i].dotDotDotToken)
          variadic = true

        label = subparams[i]
        if (mode === 'typeOnly') {
          const type = label.type
          if (type && type.getFullText().includes('|')) {
            label = type.types.map(getType).filter(Boolean).join(' | ')
          }
          else {
            const e = label.type
            label = e ? getType(e) : e
          }
          if (label && variadic)
            variadicLabel = label
        }
        else if (mode === 'variableAndType') {
          if (!label.type)
            continue
          let type = label.type.getFullText()

          if (type.includes('|')) {
            const types = label.type?.types
            if (types)
              type = types.map(getType).filter(Boolean).join(' | ')
          }
          else {
            const e = label.type
            type = e ? getType(e) : type.replace(/\s*\n\s*/g, '').trim()
          }
          label = `${type.replace(/(readonly)|(private)|(public)|(protected)|(static)|(abstract)\s*/g, '')} ${label.name.escapedText}`
        }
        else if (mode === 'variableOnly') {
          label = label.name.escapedText
        }
        if (variadic) {
          const match = label.match(/([\w,\(\)\|\s\<\>\[\]]+)(\[\])(.*)/)
          if (match)
            variadicLabel = match[1].replace(/^\s*?\((.*)\)$/, '$1') + match[3]
          else
            variadicLabel = label
          label = `${variadicLabel}[${variadicCounter}]`
          variadicCounter++
        }
      }
      if (label) {
        params.push({
          label: `${label.trim().replaceAll(replacethreepoint, '...').replace(/;}/g, '}')}:`,
          start: node.arguments[i].getStart(),
          end: node.arguments[i].getEnd(),
        })
      }
    }
    return params
  }

  return false
}
const typescriptReg = /```typescript(.*?)```/s

function getTypescriptType(hoverCommand) {
  for (let i = 0; i < hoverCommand.length; i++) {
    const items = hoverCommand[i].contents
    for (let j = 0; j < items.length; j++) {
      const match = items[j].value.match(typescriptReg)
      if (match)
        return match[1]
    }
  }
}

function getType(e) {
  const text = e.getText()
  let result = null
  if (e.elementType && e.elementType.typeName)
    result = e.elementType.typeName.escapedText
  else if (e.typeName)
    result = e.typeName.escapedText
  else if (e.kind === ts.SyntaxKind.FunctionType)
    result = 'Function'
  // else if (e.kind === ts.SyntaxKind.TypeLiteral)
  //   result = ''
  else if (e.kind === ts.SyntaxKind.StringKeyword)
    result = 'String'
  else if (e.kind === ts.SyntaxKind.NumberKeyword)
    result = 'Number'
  else if (e.kind === ts.SyntaxKind.BooleanKeyword)
    result = 'Boolean'
  else if (e.kind === ts.SyntaxKind.ObjectKeyword)
    result = 'Object'
  return result ?? text
}
