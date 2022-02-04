export type Callback<T> = (err: any, result: T) => void

export const PromiseFromCallback = async <T>(func: (callback: Callback<T>) => void) => {
  return new Promise<T>((resolve, reject) => {
    const callback: Callback<T> = (e, r) => {
      if (e) {
        reject(e)
      } else {
        resolve(r)
      }
    }

    func(callback)
  })
}
