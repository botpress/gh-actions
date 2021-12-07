import { ChangelogWriterOpts, PullRequestIssues } from './types'
import angular from 'conventional-changelog-angular'

import * as core from '@actions/core'
import * as github from '@actions/github'

export class Transformer {
  static defaultTransform = async (): Promise<Function> => (await angular).conventionalChangelog.writerOpts.transform

  private pullRequestNumbers: number[] = []
  private pullRequestIssues: PullRequestIssues = {}

  fetchPullRequestNumbers: ChangelogWriterOpts['transform'] = (commit, _context) => {
    // We only want the first issue as it is the PR number
    if (commit.references.length) {
      const issue = commit.references[0].issue
      this.pullRequestNumbers.push(Number(issue))
    }

    return commit
  }

  referenceIssues: ChangelogWriterOpts['transform'] = (commit, _context) => {
    if (commit.references.length) {
      const issue = commit.references[0].issue

      const issues = this.pullRequestIssues[Number(issue)]

      for (const issue of issues) {
        commit.references.push({
          action: 'closes',
          owner: null,
          repository: null,
          issue: issue.replace('#', ''),
          raw: issue,
          prefix: '#'
        })
      }
    }

    return commit
  }

  getIssues = async (owner: string, repo: string) => {
    const token = core.getInput('token')

    for (const pull_number of this.pullRequestNumbers) {
      console.log('pull_number', pull_number)
      const octokit = github.getOctokit(token)
      const pr = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number
      })

      const description = pr.data.body
      if (!description) {
        this.pullRequestIssues[pull_number] = []
        continue
      }

      const issues = this.extractIssues(description)

      this.pullRequestIssues[pull_number] = issues
    }
  }

  private extractIssues = (description: string): string[] => {
    const issues = new Set<string>()
    const re = /(?:(?<![/\w-.])\w[\w-.]+?\/\w[\w-.]+?|\B)#[1-9]\d*?\b/g

    for (const line of description.split('\n')) {
      // TODO: Add more keywords
      if (!['closes', 'fixes', 'resolves'].includes(line)) {
        continue
      }

      const matches = line.match(re)

      if (matches.length) {
        for (const match of matches) {
          issues.add(match)
        }
      }
    }

    return Array.from(issues)
  }
}
