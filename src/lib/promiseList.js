module.exports.promiseList = () => {
  const list = []
  return {
    done: async () => {
      if (list.length)
        return await Promise.all(list.map(e => e.promise))

      return true
    },
    list,
    push: (promise) => {
      list.push(promise)
    },
    cancel: () => {
      list.forEach((promise) => {
        promise.reject()
      })
    },
  }
}
