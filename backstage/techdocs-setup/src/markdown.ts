import * as core from '@actions/core'
import chalk from 'chalk'
import path from 'path'
import { exists, copyFile } from './fs'

const imgRegex = /!\[.*\]\(((.+)\.(svg|gif|png|jpe?g))\)/g

export const listImgs = (content: string, directory: string) => {
  const matches = imgRegex.exec(content)

  if (!matches) {
    return []
  }

  return matches
    .map((_, __, groups) => groups[0])
    .filter(imgPath => {
      const filePath = path.join(directory, imgPath)

      const fileExists = exists(filePath)

      if (fileExists) {
        core.info(`Image file exist locally ${chalk.blue(filePath)}`)
      } else {
        core.info(`Image file doesn't exist locally ${chalk.yellow(filePath)}`)
      }

      return fileExists
    })
}

export const copyImgs = (imgPaths: string[], sourceDir: string, destDir: string) => {
  imgPaths.forEach(imgPath => {
    const source = path.join(sourceDir, imgPath)
    const dest = path.join(destDir, imgPath)
    core.info(`Copying image from ${source} to ${dest}`)
    copyFile(source, dest)
  })
}
