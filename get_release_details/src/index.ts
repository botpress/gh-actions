import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import * as core from '@actions/core'

import { buildChangelog } from './changelog/changelog'
import { BASE_PATH } from './changelog/utils'
import { PromiseFromCallback } from './utils'

const getLastTag = async (): Promise<string | undefined> => {
  core.info('getLastTag called')

  await PromiseFromCallback((cb) => exec('git describe --tags --abbrev=0', cb))

  core.info('Promise returned')

  const tag = await PromiseFromCallback<string>((cb) => exec('git describe --tags --abbrev=0', cb))

  core.info(`tag fetched ${tag}`)

  if (/^v\d/.test(tag)) {
    return tag
  }
}

const run = async () => {
  core.info('Run called')
  try {
    const lastReleaseTag = await getLastTag()
    const previousVersion = lastReleaseTag?.replace(/^v/, '')

    core.setOutput('latest_tag', lastReleaseTag)

    const pkg: string = await PromiseFromCallback((cb) =>
      fs.readFile(path.resolve(BASE_PATH, 'package.json'), 'utf-8', cb)
    )

    const currentVersion = JSON.parse(pkg).version
    const isNewRelease = previousVersion !== currentVersion

    core.setOutput('version', currentVersion)
    core.setOutput('is_new_release', isNewRelease)

    // No need to generate changelogs when it's not a new release
    const changelog = isNewRelease ? await buildChangelog() : ''

    core.setOutput('changelog', changelog)
  } catch (err) {
    core.info(`An error occurred ${err}`)
    core.setFailed(err as Error)
  }
}

run()
