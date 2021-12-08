import 'bluebird-global'
import changelog, { Options } from 'conventional-changelog'
import fse from 'fs-extra'
import path from 'path'
import { ChangelogWriterOpts, CommitsParserOpts, Context, GitRawCommitsOptions } from './types'
import { Transformer } from './issues'

export const buildChangelog = async (previousVersion: string) => {
  let text = ''

  const transformer = new Transformer()
  const defaultTransform = await Transformer.defaultTransform()
  // see options here: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages
  const changelogOts: Options = {
    preset: 'angular',
    releaseCount: 1
  }
  const context: Context = {}
  const gitRawCommitsOpts: GitRawCommitsOptions = {
    merges: null
  }
  const commitsParserOpts: CommitsParserOpts = {
    mergePattern: /^Merge pull request #(\d+) from (.*)/gi,
    mergeCorrespondence: ['id', 'source']
  }
  const changelogWriterOpts: ChangelogWriterOpts = {
    transform: (commit, context) => {
      ;(transformer.referenceIssues as any)(commit, context)

      return defaultTransform(commit, context)
    }
  }

  await Promise.fromCallback((cb) =>
    changelog(changelogOts, context, gitRawCommitsOpts, commitsParserOpts, {
      transform: transformer.fetchPullRequestNumbers
    })
      .on('data', () => {})
      .on('end', cb)
  )

  await transformer.getIssues('botpress', 'gh-actions')

  const stream = changelog(changelogOts, context, gitRawCommitsOpts, commitsParserOpts, changelogWriterOpts)
  stream.on('data', (chunk) => (text += chunk))
  await Promise.fromCallback((cb) => stream.on('end', cb))

  const filePath = path.join(process.env.INPUT_PATH || process.env.GITHUB_WORKSPACE, 'CHANGELOG.md')
  fse.appendFile(filePath, text.toString(), { encoding: 'utf-8' })

  return text.toString()
}
