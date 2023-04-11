const { Range } = require('vscode')
const Hints = require('../../lib/hints')

class HintList {
  constructor(positionOf, editor) {
    this.hints = []
    this.positionOf = positionOf
    this.editor = editor
  }

  addHint(hint = null) {
    if (hint) {
      this.hints.push(hint)
      return true
    }
    else {
      return false
    }
  }

  nodeVisible(node) {
    const lineStart = this.positionOf(node.start).line
    const lineEnd = this.positionOf(node.final_end).line
    for (const range of this.editor.visibleRanges) {
      const maxStart = Math.max(0, range.start.line - 100)
      const maxEnd = range.end.line + 100
      if (lineStart >= maxStart && lineStart <= maxEnd)
        return true

      if (lineEnd >= maxStart && lineEnd <= maxEnd)
        return true

      if (lineStart <= maxStart && lineEnd >= maxEnd)
        return true
    }
    return false
  }

  clearHints() {
    this.hints = []
  }

  getHints() {
    const hintList = []
    if (this.hints.length) {
      for (const hint of this.hints) {
        hintList.push(Hints.paramHint(hint.label, new Range(
          this.positionOf(hint.start),
          this.positionOf(hint.end),
        )))
      }
    }
    else {
      return []
    }
    return hintList
  }
}
module.exports = HintList
