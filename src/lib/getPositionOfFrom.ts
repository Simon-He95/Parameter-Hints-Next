export function getPositionOfFrom(editor: any) {
  return (characterIndex: any) => editor.document.positionAt(characterIndex)
}
