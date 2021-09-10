import { exec } from 'child_process'
import 'bluebird-global'
import path from 'path'
import fs from 'fs'
// import semver from 'semver'

const getLastTags = async () => {
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
  const lastReleaseTag = await getLastTags()

  const workspace = process.env.GITHUB_WORKSPACE
  console.log('ws', workspace)
  console.log('path', process.env.INPUT_PATH)
  console.log('e', path.resolve(process.env.INPUT_PATH || workspace, 'package.json'))
  const pkg = fs.readFileSync(path.resolve(process.env.INPUT_PATH || workspace, 'package.json'), 'utf-8')

  const packageJson = JSON.parse(pkg)
  const lastVersion = packageJson.version

  // console.log(semver.coerce(lastVersion))

  console.log(`::set-output name=tag::${lastReleaseTag}`)
  console.log(`::set-output name=isNewRelease::${lastReleaseTag !== lastVersion}`)
}

run()
