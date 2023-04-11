const { getPositionOfFrom } = require("../../lib/getPositionOfFrom");
const { promiseList } = require("../../lib/promiseList");
const HintList = require("./hintList");

module.exports = async (state, pipeline, editor, parser, after, providers, parserOptions = {}) => {
    const text = editor.document.getText();
    const positionOf = getPositionOfFrom(editor);
    const nodes = parser(text, parserOptions);
    const runner = async () => {
        const hintList = new HintList(positionOf, editor);
        const promises = promiseList();
        for (const node of nodes) {
            if (!hintList.nodeVisible(node))
                continue
            const pipes = pipeline(async () => {
                const provider = await providers[0](editor, node, positionOf);
                if (!provider || !provider.length)
                    return false;

                provider.forEach(hint => hintList.addHint(hint))
                return true;
            });
            for (let i = 1; i < providers.length; i++) {
                pipes.pipe(
                    async () => {
                        const provider = await providers[i](editor, node, positionOf);
                        if (!provider || !provider.length)
                            return false;
                        provider.forEach(hint => hintList.addHint(hint))
                        return true;
                    }
                )
            }
            pipes.pipe(() => true);

            promises.push(pipes);
        }
        await promises.done();

        return hintList.getHints();
    }
    let hints = await runner();
    let count = 0;
    if (!state.done) {
        after(hints);
    }
    while (hints.length == 0 && count < 3 && !state.done) {
        await new Promise(r => setTimeout(r, 2000));
        if (!state.done) {
            hints = await runner();
            if (!state.done) {
                after(hints);
            }
        }
        count++;
    }
    if (!hints || hints.length == 0) {
        return [];
    }
    if (!state.done) {
        after(hints);
    }
    return hints;
}
