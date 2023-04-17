import { promisable } from '../../lib/pipePromise'
import { cancellablePromise } from '../../lib/cancellablePromise'

export function runner(languageRunner: any, editor: any, after: any, cacheMap: any, parserOptions = {}) {
  let _languageRunner = null
  const _runner = cancellablePromise(async (resolve: any, reject: any, state: any) => {
    _languageRunner = () => promisable(async () => await languageRunner(state, (action: any) => promisable(action, () => state.done), editor, after, cacheMap, parserOptions), () => state.done)

    try {
      await (_languageRunner().promise)
    }
    catch (e) {

    }
  })
  _runner.catch((e: any) => {
    console.log(e)
  })
  return _runner
}
