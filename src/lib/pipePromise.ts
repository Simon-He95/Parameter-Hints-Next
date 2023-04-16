import { cancellablePromise } from './cancellablePromise'

function pipe(action, condition, previousPromise, broken = false) {
  let next = null
  let promise
  let runningPromise = previousPromise
  if (!broken) {
    promise = () => {
      runningPromise = cancellablePromise(async (resolve, reject) => {
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
      runningPromise = cancellablePromise(async (resolve, reject) => {
        reject()
      })
      return runningPromise
    }
  }
  return {
    pipe(action) {
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

export function promisable(action, condition) {
  let next = null
  let interval
  const promise = cancellablePromise(async (resolve, reject, state) => {
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
    pipe(action) {
      next = pipe(action, condition, promise, condition && condition())
      return next
    },
    promise,
    reject() {
      promise.reject(true)
    },
  }
}

export function promisableOne(action, condition) {
  let interval
  const promise = cancellablePromise(async (resolve, reject, state) => {
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
