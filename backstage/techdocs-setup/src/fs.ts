import { lstatSync, existsSync, copyFileSync, mkdirSync, writeFileSync } from 'fs'
import { dirname, sep } from 'path'

export enum FileStat {
  UNKNOWN = 'UNKNOWN',
  FILE = 'FILE',
  DIRECTORY = 'DIRECTORY'
}

export const stat = (filePath: string) => {
  try {
    const stat = lstatSync(filePath)

    if (stat.isFile()) {
      return FileStat.FILE
    }

    if (stat.isDirectory()) {
      return FileStat.DIRECTORY
    }

    return FileStat.UNKNOWN
  } catch (e) {
    return FileStat.UNKNOWN
  }
}

export const exists = (filePath: string) => {
  try {
    return existsSync(filePath)
  } catch (e) {
    return false
  }
}

export const createFile = (content: string, dest: string) => {
  const dir = dirname(dest)
  mkdirSync(dir, { recursive: true })
  writeFileSync(dest, content)
}

export const copyFile = (src: string, dest: string) => {
  const dir = dirname(dest)
  mkdirSync(dir, { recursive: true })
  copyFileSync(src, dest)
}

export const parentDir = (source: string) => {
  const parts = removeSuffixSeparator(source).split(sep)
  parts.pop()
  return parts.join(sep)
}

const removeSuffixSeparator = (path: string) => (path.endsWith(sep) ? path.slice(0, -1) : path)
