import chalk from 'chalk'
import fs from 'fs'
import { load } from 'js-yaml'
import { extname } from 'path'

export const readFile = (filename: string) => {
  const extension = extname(filename)

  const content = fs.readFileSync(filename).toString()

  switch (extension) {
    case '.yml':
    case '.yaml':
      return load(content)
    case '.json':
      return JSON.parse(content)
    default:
      throw Error(`No parser found for extension ${chalk.blue(extension)}`)
  }
}
