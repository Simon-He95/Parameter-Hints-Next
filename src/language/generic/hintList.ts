import type { TextEditor } from 'vscode'
import { Range } from 'vscode'
import { Hints } from '../../lib/hints'

export class HintList {
  hints: any
  positionOf: any
  editor: TextEditor
  constructor(positionOf: any, editor: any) {
    this.hints = []
    this.positionOf = positionOf
    this.editor = editor
  }

  addHint(hint = null) {
    if (!hint)
      return false

    this.hints.push(hint)
    return true
  }

  nodeVisible(node: any) {
    const lineStart = this.positionOf(node.start).line
    const lineEnd = this.positionOf(node.final_end).line
    return this.editor.visibleRanges.some((range) => {
      const maxStart = Math.max(0, range.start.line - 100)
      const maxEnd = range.end.line + 100
      return (lineStart >= maxStart && lineStart <= maxEnd)
      || (lineEnd >= maxStart && lineEnd <= maxEnd)
      || (lineStart <= maxStart && lineEnd >= maxEnd)
    })
  }

  clearHints() {
    this.hints = []
  }

  getHints() {
    if (!this.hints.length)
      return []

    const hintList = []
    for (const hint of this.hints) {
      hintList.push(Hints.paramHint(hint.label, new Range(
        this.positionOf(hint.start),
        this.positionOf(hint.end),
      )))
    }
    return hintList
  }

  getHint(hint: any) {
    return Hints.paramHint(hint.label, new Range(
      this.positionOf(hint.start),
      this.positionOf(hint.end),
    ))
  }
}
