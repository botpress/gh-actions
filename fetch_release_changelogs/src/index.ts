import * as core from '@actions/core'
import { exec } from 'child_process'
import { getChangelogs } from './changelog'
import { PromiseFromCallback } from './utils'
import { getVersionsRange } from './version'

const getLastTwoTags = async (): Promise<string[] | undefined> => {
  //await PromiseFromCallback((cb) => exec('git fetch --prune --unshallow', cb)).catch()
  const tags = await PromiseFromCallback<string>((cb) => exec('git tag | sort -V | tail -2', cb))

  if (/v\d.*/g.test(tags)) {
    return tags.split('\n')
  }
}

const capitalize = (str: string): string => {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`
}

const run = async () => {
  try {
    const tags = (await getLastTwoTags()) || []
    const ranges = await getVersionsRange(tags)
    let changelogs: string = ''

    for (const [repo, versions] of Object.entries(ranges)) {
      const repoChangelogs = await getChangelogs(repo, versions)

      if (repoChangelogs.length) {
        changelogs = `${changelogs}\n#${capitalize(repo)}\n${repoChangelogs.join('\n')}`
      }
    }

    core.setOutput('changelogs', changelogs)
  } catch (err) {
    core.setFailed(err as Error)
  }
}

void run()
