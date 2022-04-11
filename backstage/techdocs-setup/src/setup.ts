import * as core from '@actions/core'
import chalk from 'chalk'
import { readFileSync } from 'fs'
import { nanoid } from 'nanoid'
import { dirname, join } from 'path'
import { FileStat, stat, createFile, parentDir, exists } from './fs'
import { listImgs, copyImgs } from './markdown'
import { generateMkdocsConfigFile, readMkdocsConfig } from './mkdocs'

const mkdocsFilename = 'mkdocs.yml'

export const setup = (source: string) => {
  const type = stat(source)

  switch (type) {
    case FileStat.FILE:
      core.info(`Techdocs source is a file ${chalk.blue(source)}`)
      setupFile(source)
      break
    case FileStat.DIRECTORY:
      core.info(`Techdocs source is a directory ${chalk.blue(source)}`)
      setupDirectory(source)
      break
    default:
      throw Error(`invalid source make sure the source ${chalk.blue(source)} exists`)
  }
}

const setupFile = (source: string) => {
  const sourceDirectory = dirname(source)
  const outputDirectory = nanoid()

  const markdownContent = readFileSync(source).toString()

  const indexFile = join(outputDirectory, 'index.md')
  core.info(`Creating index file of documentation ${chalk.blue(indexFile)}`)
  createFile(markdownContent, indexFile)

  const imgPaths = listImgs(markdownContent, sourceDirectory)
  copyImgs(imgPaths, sourceDirectory, outputDirectory)

  const config = generateMkdocsConfigFile(outputDirectory, mkdocsFilename)

  core.setOutput('output', config.site_dir)
  core.setOutput('source', '.')
}

const setupDirectory = (source: string) => {
  const parentDirectory = parentDir(source)
  const mkdocsFile = join(parentDirectory, mkdocsFilename)

  if (!exists(mkdocsFile)) {
    const config = generateMkdocsConfigFile(source, mkdocsFile)
    core.setOutput('output', config.site_dir)
  } else {
    const config = readMkdocsConfig(mkdocsFile)
    core.setOutput('output', config?.site_dir ?? 'site')
  }

  core.setOutput('source', parentDirectory ?? '.')
}
