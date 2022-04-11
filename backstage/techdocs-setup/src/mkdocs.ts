import * as core from '@actions/core'
import * as github from '@actions/github'
import chalk from 'chalk'
import { readFileSync } from 'fs'
import { dump, load } from 'js-yaml'
import { nanoid } from 'nanoid'
import { createFile } from './fs'

interface MkdocsConfig {
  site_name: string
  docs_dir: string
  site_dir: string
  plugins: string[]
}

export const generateMkdocsConfigFile = (source: string, mkdocsFile: string) => {
  const mkdocs: MkdocsConfig = {
    site_name: github.context.repo.repo,
    docs_dir: source,
    site_dir: nanoid(),
    plugins: ['techdocs-core']
  }

  core.info(`Creating mkdocs file ${chalk.blue(mkdocsFile)}`)
  createFile(dump(mkdocs), mkdocsFile)

  return mkdocs
}

export const readMkdocsConfig = (mkdocsFile: string) => {
  core.info(`Reading existing mkdocs file ${chalk.blue(mkdocsFile)}`)
  const content = readFileSync(mkdocsFile).toString()
  const config = load(content) as any

  if (!config) {
    core.warning(`Unable to parse mkdocs config file ${chalk.yellow(mkdocsFile)} make sure the ${chalk.blue('yaml')} format is valid `)
    return {}
  }

  return config
}
