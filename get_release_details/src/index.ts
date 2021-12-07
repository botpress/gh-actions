import { exec } from 'child_process'
import 'bluebird-global'
import path from 'path'
import fs from 'fs'
import { buildChangelog } from './changelog/changelog'

const getLastTag = async (): Promise<string> => {
  const rawTags: string = await Promise.fromCallback((cb) => exec('git rev-list --tags --max-count=30', cb))
  const tags = rawTags.trim().split('\n').join(' ')

  const rawRevs: string = await Promise.fromCallback((cb) => exec(`git describe --abbrev=0 --tags ${tags}`, cb))
  const revs = rawRevs.trim().split('\n')

  for (let i = 0; i < revs.length; i++) {
    if (/^v\d/.test(revs[i])) {
      return revs[i]
    }
  }
}

const run = async () => {
  // TODO¨: Remove this
  buildChangelog('')
  return

  const { GITHUB_WORKSPACE, INPUT_PATH } = process.env
  const lastReleaseTag = await getLastTag()
  const previousVersion = lastReleaseTag.replace(/^v/, '')

  console.log(`::set-output name=latest_tag::${lastReleaseTag}`)

  try {
    const pkg = fs.readFileSync(path.resolve(INPUT_PATH || GITHUB_WORKSPACE, 'package.json'), 'utf-8')

    const currentVersion = JSON.parse(pkg).version
    const isNewRelease = previousVersion !== currentVersion

    console.log(`::set-output name=version::${currentVersion}`)
    console.log(`::set-output name=is_new_release::${isNewRelease}`)

    // No need to generate changelogs when it's not a new release
    const changelog = isNewRelease ? await buildChangelog(previousVersion) : ''

    console.log(`::set-output name=changelog::${changelog}`)
  } catch (err) {
    console.error('Cannot process package.json', err)
    throw err
  }
}

run()
