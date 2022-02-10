import * as core from '@actions/core'
import { exec } from 'child_process'
import { getChangelogs } from './changelog'
import { PromiseFromCallback } from './utils'
import { getVersionsRange } from './version'

const getLastTag = async (): Promise<string | undefined> => {
  await PromiseFromCallback((cb) => exec('git fetch --prune --unshallow', cb)).catch(() => {})
  const tag = await PromiseFromCallback<string>((cb) => exec('git describe --tags --abbrev=0', cb))

  return tag.match(/^v\d+\.\d+\.\d+/)?.[0]
}

const getLastCommit = async (): Promise<string | undefined> => {
  await PromiseFromCallback((cb) => exec('git fetch --prune --unshallow', cb)).catch(() => {})
  const commit = await PromiseFromCallback<string>((cb) => exec('git rev-parse HEAD', cb))

  return commit
}

const capitalize = (str: string): string => {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`
}

const run = async () => {
  try {
    const tag = await getLastTag()
    const commit = await getLastCommit()

    core.debug(`Last tag: ${tag}`)
    core.debug(`Last commit: ${commit}`)

    if (!tag || !commit) {
      throw new Error('Cannot fetch last commit or last tag')
    }

    const ranges = await getVersionsRange([tag, commit])
    let changelogs: string = ''

    for (const [repo, versions] of Object.entries(ranges)) {
      const repoChangelogs = await getChangelogs(repo, versions)

      if (repoChangelogs.length) {
        changelogs = `${changelogs}\n\n# ${capitalize(repo)}\n\n${repoChangelogs.join('\n\n')}`
      }
    }

    core.setOutput('changelogs', changelogs)
  } catch (err) {
    core.setFailed(err as Error)
  }
}

void run()
