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
    .filter(imgPath => exists(path.join(directory, imgPath)))
}

export const copyImgs = (imgPaths: string[], sourceDir: string, destDir: string) => {
  imgPaths.forEach(imgPath => {
    const source = path.join(sourceDir, imgPath)
    const dest = path.join(destDir, imgPath)
    copyFile(source, dest)
  })
}
