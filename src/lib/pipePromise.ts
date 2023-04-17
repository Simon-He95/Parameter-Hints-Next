import { cancellablePromise } from './cancellablePromise'

function pipe(action: any, condition: any, previousPromise: any, broken = false) {
  let next: any = null
  let promise
  let runningPromise = previousPromise
  if (!broken) {
    promise = () => {
      runningPromise = cancellablePromise(async (resolve: any, reject: any) => {
        try {
          const output = await action()
          resolve(output)
        }
        catch (e) {
          if (e === 'cancelled') {
            reject()
          }
          else {
            if (next)
              resolve(next.runPromise())
            else
              resolve(false)
          }
        }
      })
      return runningPromise
    }
  }
  else {
    promise = () => {
      runningPromise = cancellablePromise(async (resolve: any, reject: any) => {
        reject()
      })
      return runningPromise
    }
  }
  return {
    pipe(action: any) {
      next = pipe(action, condition, runningPromise, broken)
      return next
    },
    reject() {
      runningPromise && runningPromise.reject(true)
    },
    runPromise: promise,
    promise: runningPromise,
  }
}

export function promisable(action: any, condition: any) {
  let next: any = null
  let interval: any
  const promise = cancellablePromise(async (resolve: any, reject: any, state: any) => {
    try {
      const output = await action(state)
      if (!output)
        throw new Error('error')
      else
        resolve(output)
    }
    catch (e) {
      if (e === 'cancelled') {
        reject()
      }
      else {
        if (next)
          resolve(next.runPromise())
        else
          resolve(false)
      }
    }
  }, () => {
    if (interval)
      clearInterval(interval)
  })
  if (condition) {
    interval = setInterval(() => {
      if (condition())
        !promise.state.done && promise.reject(true)
    }, 16)
  }

  return {
    pipe(action: any) {
      next = pipe(action, condition, promise, condition && condition())
      return next
    },
    promise,
    reject() {
      promise.reject(true)
    },
  }
}

export function promisableOne(action: any, condition: any) {
  let interval: any
  const promise = cancellablePromise(async (resolve: any, reject: any, state: any) => {
    try {
      const output = await action(state)
      resolve(output)
    }
    catch (e) {
      reject()
    }
  }, () => {
    if (interval)
      clearInterval(interval)
  })
  if (condition) {
    interval = setInterval(() => {
      if (condition())
        !promise.state.done && promise.reject(true)
    }, 16)
  }

  return {
    promise,
    reject() {
      promise.reject(true)
    },
  }
}
