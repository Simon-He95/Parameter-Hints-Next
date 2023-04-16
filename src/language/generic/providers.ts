const vscode = require('vscode')

export async function executeHoverProvider(editor, nodePosition) {
  return await vscode.commands.executeCommand(
    'vscode.executeHoverProvider',
    editor.document.uri,
    nodePosition,
  )
}
export async function executeSignatureHelpProvider(editor, nodePosition) {
  return await vscode.commands.executeCommand(
    'vscode.executeSignatureHelpProvider',
    editor.document.uri,
    nodePosition,
    '(')
}
