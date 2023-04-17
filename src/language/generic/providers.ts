import * as vscode from 'vscode'

export async function executeHoverProvider(editor: vscode.TextEditor, nodePosition: any) {
  return await vscode.commands.executeCommand(
    'vscode.executeHoverProvider',
    editor.document.uri,
    nodePosition,
  )
}
export async function executeSignatureHelpProvider(editor: vscode.TextEditor, nodePosition: any) {
  return await vscode.commands.executeCommand(
    'vscode.executeSignatureHelpProvider',
    editor.document.uri,
    nodePosition,
    '(')
}
