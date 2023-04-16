export function getPositionOfFrom(editor) {
  return characterIndex => editor.document.positionAt(characterIndex)
}
