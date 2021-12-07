import 'bluebird-global'
import changelog, { Options } from 'conventional-changelog'
import { removeDuplicates } from './utils'
import fs from 'fs'
import path from 'path'
import { ChangelogWriterOpts, CommitsParserOpts, Context, GitRawCommitsOptions } from './types'
import { Transformer } from './issues'

const fetchChangelogs = (): string | undefined => {
  try {
    const { GITHUB_WORKSPACE, INPUT_PATH } = process.env
    return fs.readFileSync(path.resolve(INPUT_PATH || GITHUB_WORKSPACE, 'CHANGELOG.md'), 'utf-8')
  } catch (err) {
    return undefined
  }
}

export const buildChangelog = async (previousVersion: string) => {
  let text = ''
  const changelogFileContent = fetchChangelogs()
  if (changelogFileContent) {
    text = removeDuplicates(changelogFileContent, previousVersion)
  } else {
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
  }

  return text.toString().replace(/\%/g, '%25').replace(/\n/g, '%0A').replace(/\r/g, '%0D')
}
