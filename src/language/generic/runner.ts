import { promisable } from '../../lib/pipePromise'
import { cancellablePromise } from '../../lib/cancellablePromise'

export function runner(languageRunner, editor, after, cacheMap, parserOptions = {}) {
  let _languageRunner = null
  const _runner = cancellablePromise(async (resolve, reject, state) => {
    _languageRunner = () => promisable(async () => await languageRunner(state, action => promisable(action, () => state.done), editor, after, cacheMap, parserOptions), () => state.done)

    try {
      await (_languageRunner().promise)
    }
    catch (e) {

    }
  })
  _runner.catch((e) => {
    console.log(e)
  })
  return _runner
}
