import * as core from '@actions/core'
import { exec } from 'child_process'
import { PullRequest } from './pull-requests'
import { PromiseFromCallback } from './utils'

const getLastTwoTags = async (): Promise<string[] | undefined> => {
  await PromiseFromCallback((cb) => exec('git fetch --prune --unshallow', cb)).catch(() => {})
  const tags = await PromiseFromCallback<string>((cb) => exec('git tag | sort -V | tail -2', cb))

  if (/v\d.*/g.test(tags)) {
    return tags.split('\n')
  }
}

const run = async () => {
  try {
    const tags = await getLastTwoTags()
    if (!tags || tags.length < 2) {
      return core.setFailed('No tag could be fetched from the git history')
    }

    const [previousTag, newTag] = tags
    const comment = core.getInput('comment') as string | undefined

    const pullRequest = new PullRequest()
    await pullRequest.listPullRequests(previousTag, newTag)
    await pullRequest.getIssues()
    await pullRequest.closeIssues(comment)
  } catch (err) {
    core.setFailed(err as Error)
  }
}

void run()
