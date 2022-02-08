import * as core from '@actions/core'
import changelog, { Options } from 'conventional-changelog'
import fs from 'fs'
import path from 'path'

import { PromiseFromCallback, BASE_PATH } from '../utils'
import { Transformer } from './issues'
import { CommitsParserOpts, Context, GitRawCommitsOptions } from './types'

const updateChangelog = async (text: string) => {
  const filePath = path.join(BASE_PATH, 'CHANGELOG.md')

  // Checks if file exists
  if (!fs.existsSync(filePath)) {
    return
  }

  const existingChangelog = await PromiseFromCallback((cb) => fs.readFile(filePath, { encoding: 'utf-8' }, cb))
  return PromiseFromCallback((cb) =>
    fs.writeFile(filePath, `${text}${existingChangelog}`, { encoding: 'utf-8' }, () => cb(null, undefined))
  )
}

export const buildChangelog = async () => {
  // The transformer is use to extract issues closed by Pull Requests
  const transformer = new Transformer()
  const defaultTransform = await Transformer.defaultTransform()

  core.info(path.resolve(__dirname, './angular/index.js'))
  core.info(__dirname)

  core.info(JSON.stringify(fs.readdirSync(__dirname), undefined, 4))
  //core.info(JSON.stringify(fs.readdirSync(path.resolve(__dirname, './angular')), undefined, 4))

  const aa = require('conventional-changelog-angular')
  core.info(aa)
  core.info(JSON.stringify(path.isAbsolute(path.resolve(__dirname, './angular/index.js'))))

  // see options here: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages
  const changelogOts: Options = {
    preset: 'angular', // process.env.NODE_ENV === 'test' ? 'angular' : path.resolve(__dirname, './angular/index.js'),
    releaseCount: 1,
    warn: core.warning,
    debug: core.debug
  }
  const context: Context = {}
  const gitRawCommitsOpts: GitRawCommitsOptions = {
    merges: null
  }
  const commitsParserOpts: CommitsParserOpts = {
    mergePattern: /^Merge pull request #(\d+) from (.*)/gi,
    mergeCorrespondence: ['id', 'source']
  }

  // Since fetching pull request information requires the code to be async,
  // we have to run changelog once using the custom transformer and then
  // re-running it with the default one afterwards
  await PromiseFromCallback((cb) =>
    changelog(changelogOts, context, gitRawCommitsOpts, commitsParserOpts, {
      transform: transformer.fetchPullRequestNumbers
    })
      .on('data', () => {})
      .on('end', cb)
      .on('error', cb)
  )

  // We fetch the issues referenced in Pull Requests we just crawled
  const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/')
  await transformer.getIssues(owner, repo)

  let text = ''

  const stream = changelog(changelogOts, context, gitRawCommitsOpts, commitsParserOpts, {
    transform: (commit, context) => {
      transformer.referenceIssues(commit, context)

      return defaultTransform(commit, context)
    }
  })
  stream.on('data', (chunk) => (text += chunk))
  await PromiseFromCallback((cb) => stream.on('end', cb).on('error', cb))

  text = text.toString()

  await updateChangelog(text)

  return text
}
