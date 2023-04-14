// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode')
const ts = require('typescript')
const { minimatch } = require('minimatch')
const { runner } = require('./language/generic/runner')
const { runner: phpRunner } = require('./language/php/runner')
const { runner: typescriptRunner } = require('./language/typescript/runner')

const hintDecorationType = vscode.window.createTextEditorDecorationType({})
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

export function activate(context) {
  let activeEditor = vscode.window.activeTextEditor
  let currentRunner = null
  const cacheMap = new Map()

  const messageHeader = 'Parameter Hints: '
  const hideMessageAfterMs = 3000
  const isEnabled = vscode.workspace.getConfiguration('parameterHints').get(
    'enabled',
  )
  const languagesEnabled = vscode.workspace.getConfiguration('parameterHints').get(
    'languages',
  )
  const ignores = (vscode.workspace.getConfiguration('parameterHints').get(
    'ignores',
  ) || []).concat(['dist/**', '**/*.d.ts', '**/node_modules/**'])
  let timeout = null

  const trigger = (identifier, editor, force, time = 100) => {
    // 如果是打包后的dist目录下的文件则不再检测
    if (!editor || isIgnoredFile(editor, ignores))
      return
    const languageId = editor.document.languageId
    if (currentRunner && !currentRunner.state.done)
      currentRunner.reject()

    if (timeout)
      clearTimeout(timeout)

    const showHints = (hints) => {
      if (hints === false || !isEnabled)
        return
      editor.setDecorations(
        hintDecorationType,
        hints.length
          ? hints
          : [new vscode.Range(0, 0, 0, 0)])
    }
    timeout = setTimeout(() => {
      if (!editor)
        return
      if (!isEnabled && !force)
        return
      if (languagesEnabled.includes('php') && languageId === 'php')
        currentRunner = runner(phpRunner, editor, showHints, cacheMap, { language: ts.ScriptKind.Unknown })

      else if (languagesEnabled.includes('typescript') && languageId === 'typescript')
        currentRunner = runner(typescriptRunner, editor, showHints, cacheMap, { language: ts.ScriptKind.TS })

      else if (languagesEnabled.includes('typescriptreact') && languageId === 'typescriptreact')
        currentRunner = runner(typescriptRunner, editor, showHints, cacheMap, { language: ts.ScriptKind.TSX })

      else if (languagesEnabled.includes('javascript') && languageId === 'javascript')
        currentRunner = runner(typescriptRunner, editor, showHints, cacheMap, { language: ts.ScriptKind.JS })

      else if (languagesEnabled.includes('javascriptreact') && languageId === 'javascriptreact')
        currentRunner = runner(typescriptRunner, editor, showHints, cacheMap, { language: ts.ScriptKind.JSX })

      else if (languagesEnabled.includes('vue') && languageId === 'vue')
        currentRunner = runner(typescriptRunner, editor, showHints, cacheMap, { language: ts.ScriptKind.TS })
    }, time)
  }
  const clear = (editor) => {
    if (timeout)
      clearTimeout(timeout)
    cacheMap.clear()
    currentRunner && !currentRunner.state.done && currentRunner.reject()
    editor && editor.setDecorations(hintDecorationType, [new vscode.Range(0, 0, 0, 0)])
  }

  vscode.commands.registerCommand('parameterHints.toggle', () => {
    const currentState = vscode.workspace.getConfiguration('parameterHints').get('enabled')
    const message = `${messageHeader} Hints ${currentState ? 'disabled' : 'enabled'}`

    vscode.workspace.getConfiguration('parameterHints').update('enabled', !currentState, true)
    if (currentState)
      clear(activeEditor)

    else
      trigger('restart', activeEditor, true)

    vscode.window.setStatusBarMessage(message, hideMessageAfterMs)
  })

  trigger('on start', activeEditor, false, 100)

  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
    cacheMap.clear()
    activeEditor = editor
    if (activeEditor)
      trigger('change_active_text_editor', activeEditor, false, 100)
  }))

  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {
    if (event.contentChanges.length)
      trigger('text edited', activeEditor, false, 300)
  }))

  context.subscriptions.push(vscode.window.onDidChangeTextEditorVisibleRanges((event) => {
    activeEditor = event.textEditor
    if (activeEditor)
      trigger('scroll', activeEditor, false, 100)
  }))
}

// this method is called when your extension is deactivated
export function deactivate() { }

function isIgnoredFile(editor, ignores) {
  const filePath = editor.document.uri.fsPath
  return ignores.some(pattern => minimatch(filePath, pattern, { dot: true }))
}
