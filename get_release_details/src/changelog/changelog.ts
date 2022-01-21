import 'bluebird-global'
import changelog, { Options } from 'conventional-changelog'
import fse from 'fs-extra'
import path from 'path'
import { ChangelogWriterOpts, CommitsParserOpts, Context, GitRawCommitsOptions } from './types'
import { Transformer } from './issues'

export const buildChangelog = async (previousVersion: string) => {
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
      .on('error', cb)
  )

  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')
  await transformer.getIssues(owner, repo)

  let text = ''

  const stream = changelog(changelogOts, context, gitRawCommitsOpts, commitsParserOpts, changelogWriterOpts)
  stream.on('data', (chunk) => (text += chunk))
  await Promise.fromCallback((cb) => stream.on('end', cb).on('error', cb))

  text = text.toString()

  const filePath = path.join(process.env.INPUT_PATH || process.env.GITHUB_WORKSPACE, 'CHANGELOG.md')
  const oldChangelog = await fse.readFile(filePath, { encoding: 'utf-8' })
  await fse.writeFile(filePath, `${text}${oldChangelog}`, { encoding: 'utf-8' })

  return text
}
