export function promiseList() {
  const list: any = []
  return {
    done: async () => {
      if (list.length)
        return await Promise.all(list.map((e: any) => e.promise))

      return true
    },
    list,
    push: (promise: any) => {
      list.push(promise)
    },
    cancel: () => {
      list.forEach((promise: any) => {
        promise.reject()
      })
    },
  }
}
