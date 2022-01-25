import * as core from '@actions/core'

export type Callback<T> = (err: any, result: T) => void

export const PromiseFromCallback = async <T>(func: (callback: Callback<T>) => void) => {
  core.info(`PromiseFromCallback called`)

  return new Promise<T>((resolve, reject) => {
    const callback: Callback<T> = (e, r) => {
      core.info(`err ${e}`)
      core.info(`res ${r}`)
      if (e) {
        reject(e)
      } else {
        resolve(r)
      }
    }

    func(callback)
  })
}
