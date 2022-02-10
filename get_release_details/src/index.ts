import * as core from '@actions/core'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

import { buildChangelog } from './changelog/changelog'
import { PromiseFromCallback, BASE_PATH } from './utils'

const getLastTag = async (): Promise<string | undefined> => {
  await PromiseFromCallback((cb) => exec('git fetch --prune --unshallow', cb)).catch(() => {})
  const tag = await PromiseFromCallback<string>((cb) => exec('git describe --tags --abbrev=0', cb))

  core.debug(`tag: ${tag}`)
  core.debug(`is tag: ${/^v\d/.test(tag)}`)

  if (/^v\d/.test(tag)) {
    return tag
  }
}

const run = async () => {
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
    core.setFailed(err as Error)
  }
}

void run()
