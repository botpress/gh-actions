import * as core from '@actions/core'
import * as github from '@actions/github'
import chalk from 'chalk'
import { readFileSync } from 'fs'
import { dump } from 'js-yaml'
import { nanoid } from 'nanoid'
import { dirname, join } from 'path'
import { FileStat, stat, createFile, parentDir, exists } from './fs'
import { listImgs, copyImgs } from './markdown'

const mkdocsFilename = 'mkdocs.yml'

export const setup = (source: string) => {
  const type = stat(source)

  switch (type) {
    case FileStat.FILE:
      setupFile(source)
      break
    case FileStat.DIRECTORY:
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

  createFile(markdownContent, join(outputDirectory, 'index.md'))

  const imgPaths = listImgs(markdownContent, sourceDirectory)
  copyImgs(imgPaths, sourceDirectory, outputDirectory)

  const config = generateMkdocsConfig(outputDirectory)
  createFile(config, mkdocsFilename)

  core.setOutput('source', '.')
}

const setupDirectory = (source: string) => {
  const parentDirectory = parentDir(source)
  const mkdocsFile = join(parentDirectory, mkdocsFilename)

  if (!exists(mkdocsFile)) {
    const config = generateMkdocsConfig(source)
    createFile(config, mkdocsFile)
  }

  core.setOutput('source', parentDirectory ?? '.')
}

interface MkdocsConfig {
  site_name: string
  docs_dir: string
  site_dir: string
  plugins: string[]
}

const generateMkdocsConfig = (source: string) => {
  const mkdocs: MkdocsConfig = {
    site_name: github.context.repo.repo,
    docs_dir: source,
    site_dir: nanoid(),
    plugins: ['techdocs-core']
  }

  return dump(mkdocs)
}
