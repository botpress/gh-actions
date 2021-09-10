import 'bluebird-global'
import changelog from 'conventional-changelog'

export const buildChangelog = async () => {
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

  return text.toString().replace(/\n/g, '%0A').replace(/\r/g, '%0D').replace(/\%/g, '%25')
}
