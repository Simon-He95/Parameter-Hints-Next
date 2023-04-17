import * as vscode from 'vscode'
import * as ts from 'typescript'
import { minimatch } from 'minimatch'
import { runner } from './language/generic/runner'
import { runner as phpRunner } from './language/php/runner'
import { runner as typescriptRunner } from './language/typescript/runner'

const hintDecorationType = vscode.window.createTextEditorDecorationType({})
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

export function activate(context: vscode.ExtensionContext) {
  let activeEditor = vscode.window.activeTextEditor
  const currentRunner: any = null
  const cacheMap = new Map()
  const messageHeader = 'Parameter Hints: '
  const hideMessageAfterMs = 3000
  const isEnabled = vscode.workspace.getConfiguration('parameterHints').get(
    'enabled',
  )
  // const languagesEnabled = vscode.workspace.getConfiguration('parameterHints').get(
  //   'languages',
  // )
  const ignores = (vscode.workspace.getConfiguration('parameterHints').get(
    'ignores',
  ) as string[] || []).concat(['dist/**', '**/*.d.ts', '**/node_modules/**'])
  let timeout: any = null

  const showHints = (hints: any, editor: vscode.TextEditor) => {
    if (hints === false || !isEnabled)
      return
    editor.setDecorations(
      hintDecorationType,
      hints.length
        ? hints
        : [new vscode.Range(0, 0, 0, 0)])
  }

  const runnerMap: any = {
    php: (editor: any) => runner(phpRunner, editor, showHints, cacheMap, { language: ts.ScriptKind.Unknown }),
    typescript: (editor: any) => runner(typescriptRunner, editor, showHints, cacheMap, { language: ts.ScriptKind.TS }),
    typescriptreact: (editor: any) => runner(typescriptRunner, editor, showHints, cacheMap, { language: ts.ScriptKind.TSX }),
    javascript: (editor: any) => runner(typescriptRunner, editor, showHints, cacheMap, { language: ts.ScriptKind.JS }),
    javascriptreact: (editor: any) => runner(typescriptRunner, editor, showHints, cacheMap, { language: ts.ScriptKind.JSX }),
    vue: (editor: any) => runner(typescriptRunner, editor, showHints, cacheMap, { language: ts.ScriptKind.TS }),
    svelte: (editor: any) => runner(typescriptRunner, editor, showHints, cacheMap, { language: ts.ScriptKind.TS }),
  }
  const clear = (editor: any) => {
    if (timeout)
      clearTimeout(timeout)
    cacheMap.clear()
    currentRunner && !currentRunner.state.done && currentRunner.reject()
    editor && editor.setDecorations(hintDecorationType, [new vscode.Range(0, 0, 0, 0)])
  }

  const trigger = (identifier: any, editor: any, force: any, time = 100) => {
    // 如果是打包后的dist目录下的文件则不再检测
    if (!editor || isIgnoredFile(editor, ignores))
      return
    const languageId = editor.document.languageId
    if (currentRunner && !currentRunner.state.done)
      currentRunner.reject()

    if (timeout)
      clearTimeout(timeout)

    timeout = setTimeout(() => {
      if (!editor || (!isEnabled && !force))
        return

      const run = runnerMap[languageId]
      if (run)
        run(editor)
    }, time)
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

  // context.subscriptions.push(vscode.window.onDidChangeTextEditorVisibleRanges((event) => {
  //   activeEditor = event.textEditor
  //   if (activeEditor)
  //     trigger('scroll', activeEditor, false, 100)
  // }))
}

// this method is called when your extension is deactivated
export function deactivate() { }

function isIgnoredFile(editor: any, ignores: string[]) {
  const filePath = editor.document.uri.fsPath
  return ignores.some(pattern => minimatch(filePath, pattern, { dot: true }))
}
