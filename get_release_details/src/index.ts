import * as core from '@actions/core'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

import { buildChangelog } from './changelog/changelog'
import { PromiseFromCallback, BASE_PATH } from './utils'

const getLastTag = async (): Promise<string | undefined> => {
  await PromiseFromCallback((cb) => exec('git fetch --prune --unshallow', cb)).catch(() => {})
  const tag = await PromiseFromCallback<string>((cb) => exec('git describe --tags --abbrev=0', cb))

  return tag.match(/^v\d+\.\d+\.\d+/)?.[0]
}

const run = async () => {
  try {
    const lastReleaseTag = await getLastTag()
    const tagVersion = lastReleaseTag?.replace(/^v/, '')

    core.setOutput('latest_tag', lastReleaseTag)

    const pkg: string = await PromiseFromCallback((cb) =>
      fs.readFile(path.resolve(BASE_PATH, 'package.json'), 'utf-8', cb)
    )

    const currentVersion = JSON.parse(pkg).version as string
    const mode = core.getInput('mode')
    if (mode !== 'version' && mode !== 'tag') {
      throw new Error("Mode should either be of type 'version' or 'tag'")
    }

    let isNewRelease = false
    if (!tagVersion) {
      isNewRelease = true
    } else if (mode === 'version') {
      isNewRelease = tagVersion < currentVersion
    } else if (mode === 'tag') {
      isNewRelease = tagVersion === currentVersion
    }

    core.setOutput('version', currentVersion)
    core.setOutput('is_new_release', isNewRelease)

    // No need to generate changelogs when it's not a new release
    const changelog = isNewRelease ? await buildChangelog(mode) : ''

    core.setOutput('changelog', changelog)
  } catch (err) {
    core.setFailed(err as Error)
  }
}

void run()
