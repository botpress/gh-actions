import { exec } from 'child_process'
import 'bluebird-global'
import path from 'path'
import fs from 'fs'
import { buildChangelog } from './changelog'

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
  const { GITHUB_WORKSPACE, INPUT_PATH } = process.env
  const lastReleaseTag = await getLastTags()

  console.log(`::set-output name=tag::${lastReleaseTag}`)

  try {
    const pkg = fs.readFileSync(path.resolve(INPUT_PATH || GITHUB_WORKSPACE, 'package.json'), 'utf-8')

    const lastVersion = JSON.parse(pkg).version
    console.log(`::set-output name=is_new_release::${lastReleaseTag !== lastVersion}`)
  } catch (err) {
    console.error('Cannot process package.json')
  }
  console.log('build ch')

  const changelog = await buildChangelog()

  console.log('done', changelog)

  console.log(`::set-output name=changelog::${changelog}`)
}

run()
