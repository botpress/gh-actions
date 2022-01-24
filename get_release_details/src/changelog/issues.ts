import { ChangelogWriterOpts, PullRequestIssues, ExtractedIssues } from './types'
import angular from 'conventional-changelog-angular'

import * as core from '@actions/core'
import * as github from '@actions/github'

const RELEASE_BRANCHES = `release/`
const WHITELISTED_PR_TYPES = ['fix', 'feat']
const CLOSES_ISSUES_KEYWORDS = [
  'closes',
  'close',
  'closed',
  'fixes',
  'fixe',
  'fixed',
  'resolves',
  'resolve',
  'resolved'
]
const CLOSES_ISSUES_KEYWORDS_REGEX = new RegExp(CLOSES_ISSUES_KEYWORDS.join('|'), 'i')
const REGEX_ISSUES =
  /(?:(?<![/\w-.])\w[\w-.]+?\/\w[\w-.]+?#|(?:https:\/\/github\.com\/\w[\w-.]+?\/\w[\w-.]+?\/issues\/)|\B#)[1-9]\d*?\b/g
const REGEX_OWNER_REPO = /^https:\/\/github.com\/(.+)\/(.+)\/issues\/.*/
const REGEX_NUMBER = /[1-9]\d*/g

export class Transformer {
  static defaultTransform = async (): Promise<Function> => (await angular).conventionalChangelog.writerOpts.transform

  private pullRequestNumbers: number[] = []
  private pullRequestIssues: PullRequestIssues = {}

  fetchPullRequestNumbers: ChangelogWriterOpts['transform'] = (commit, _context) => {
    // We only want the first issue as it is the PR number
    if (commit.references.length) {
      const issue = commit.references[0].issue
      core.info(`Found PR #${issue}`)
      this.pullRequestNumbers.push(Number(issue))
    }

    return commit
  }

  referenceIssues: ChangelogWriterOpts['transform'] = (commit, _context) => {
    if (commit.references.length) {
      const issue = commit.references[0].issue

      const issues = this.pullRequestIssues[Number(issue)] || {}

      for (const { issue, owner: issueOwner, repository: issueRepository } of Object.values(issues)) {
        const [owner, repository] = this.getOwnerAndRepository(issueOwner, issueRepository)

        commit.references.push({
          action: 'closes',
          owner,
          repository,
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
      try {
        const octokit = github.getOctokit(token)
        const pr = await octokit.rest.pulls.get({
          owner,
          repo,
          pull_number
        })

        const branch = pr.data.head.ref
        const description = pr.data.body
        const title = pr.data.title
        if (
          !description ||
          branch.includes(RELEASE_BRANCHES) ||
          !WHITELISTED_PR_TYPES.some((value) => title.includes(value))
        ) {
          this.pullRequestIssues[pull_number] = {}
          continue
        }

        core.info(`PR #${pull_number} Description: ${description}`)
        const issues = this.extractIssues(description)
        core.info(`PR #${pull_number} Found issues: ${JSON.stringify(issues, undefined, 4)}`)

        this.pullRequestIssues[pull_number] = issues
      } catch (err) {
        core.info(`Pull Request #${pull_number} does not exists: ${err}`)
      }
    }
  }

  private extractIssues = (description: string): ExtractedIssues => {
    const issues: ExtractedIssues = {}

    const relevantLines = description.split('\n').filter((line) => CLOSES_ISSUES_KEYWORDS_REGEX.test(line))

    for (const line of relevantLines) {
      core.info(`Current line: ${line}`)

      const matches = line.match(REGEX_ISSUES) || []
      core.info(`Matches for that line: ${JSON.stringify(matches)}`)

      for (const match of matches) {
        core.info(`Found a match: ${match}`)
        const issue = match.match(REGEX_NUMBER)?.[0]
        // e.g. ownerRepoMatches = [ 'https://github.com/owner/repo/issues/11', 'owner', 'repo' ]
        const ownerRepoMatches = match.match(REGEX_OWNER_REPO)

        let owner = ownerRepoMatches?.[1]
        let repository = ownerRepoMatches?.[2]

        core.info(`Owner, repository and issue: ${owner}:${repository} ${issue}`)

        if (issue) {
          issues[issue] = { issue, owner, repository }
        }
      }
    }

    return issues
  }

  private getOwnerAndRepository = (issueOwner: string, issueRepository: string) => {
    let [owner, repository] = process.env.GITHUB_REPOSITORY.split('/')

    // If the issue's owner and repo is the same as the one that runs this actions, only display the issue number
    // e.g. display '#13' instead of 'owner/repo/#14'
    if (issueOwner === owner && issueRepository === repository) {
      return [null, null]
    }

    return [issueOwner, issueRepository]
  }
}
