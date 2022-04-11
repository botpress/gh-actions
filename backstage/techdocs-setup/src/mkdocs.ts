import * as github from '@actions/github'
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

  createFile(dump(mkdocs), mkdocsFile)

  return mkdocs
}

export const readMkdocsConfig = (mkdocsFile: string) => {
  const content = readFileSync(mkdocsFile).toString()
  const config = load(content) as any
  return config ?? {}
}
