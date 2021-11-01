import 'bluebird-global'
import changelog from 'conventional-changelog'
import { removeDuplicates } from './remove_changelog_duplicated'
import fs from 'fs'

const fetchChangelogs = (): string | undefined => {
  try {
    return fs.readFileSync('CHANGELOG.md', 'utf8')
  } catch {
    return undefined
  }
}

export const buildChangelog = async (previousVersion: string) => {
  const changelogFileContent = fetchChangelogs()
  if (changelogFileContent) {
    return removeDuplicates(changelogFileContent, previousVersion)
  } else {
    // see options here: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages
    const changelogOts = {
      preset: 'angular',
      releaseCount: 1
    }
    const context = {}
    const gitRawCommitsOpts = {
      merges: null
    }
    const commitsParserOpts = {
      mergePattern: /^Merge pull request #(\d+) from (.*)/gi,
      mergeCorrespondence: ['id', 'source']
    }
    const changelogWriterOpts = {}

    let text = ''
    const stream = changelog(changelogOts, context, gitRawCommitsOpts, commitsParserOpts, changelogWriterOpts)
    stream.on('data', (chunk) => (text += chunk))
    await Promise.fromCallback((cb) => stream.on('end', cb))

    return text.toString().replace(/\%/g, '%25').replace(/\n/g, '%0A').replace(/\r/g, '%0D')
  }
}
