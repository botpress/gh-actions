import * as core from '@actions/core'
import * as github from '@actions/github'
import angular from 'conventional-changelog-angular'
import { PullRequestIssues, ExtractedIssues, Transform } from './types'

const RELEASE_BRANCHES = 'release/'
const RELEASE_TITLE_REGEX = /^chore\(.*\): v.*/
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
  static defaultTransform = async (): Promise<Transform> => (await angular).conventionalChangelog.writerOpts.transform

  private pullRequestNumbers: number[] = []
  private pullRequestIssues: PullRequestIssues = {}

  fetchPullRequestNumbers: Transform = (commit, _context) => {
    if (!WHITELISTED_PR_TYPES.some((value) => commit.type?.includes(value))) {
      return false
    }

    // We only want the first issue as it is the PR number
    if (commit.references.length) {
      const issue = commit.references[0].issue
      core.debug(`Found PR #${issue}`)
      this.pullRequestNumbers.push(Number(issue))
    }

    return commit
  }

  referenceIssues: Transform = (commit, _context) => {
    if (!WHITELISTED_PR_TYPES.some((value) => commit.type?.includes(value))) {
      return false
    }

    // We only want the first issue as it is the PR number
    if (commit.references.length) {
      const issue = commit.references[0].issue
      const issues = this.pullRequestIssues[Number(issue)] || {}

      for (const { issue, owner, repository } of Object.values(issues)) {
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
        // Skip in case the PR description is empty or if it's the release PR
        if (!description || branch.includes(RELEASE_BRANCHES) || title.match(RELEASE_TITLE_REGEX)) {
          continue
        }

        core.debug(`PR #${pull_number} Description: ${description}`)
        const issues = this.extractIssues(description)

        if (Object.keys(issues).length) {
          core.debug(`PR #${pull_number} Found issues: ${JSON.stringify(issues, undefined, 4)}`)
          this.pullRequestIssues[pull_number] = issues
        }
      } catch (err) {
        core.error(`Pull Request #${pull_number} does not exists ${err}`)
      }
    }
  }

  private extractIssues = (description: string): ExtractedIssues => {
    const issues: ExtractedIssues = {}

    const relevantLines = description.split('\n').filter((line) => CLOSES_ISSUES_KEYWORDS_REGEX.test(line))

    for (const line of relevantLines) {
      const matches = line.match(REGEX_ISSUES) || []

      for (const match of matches) {
        core.debug(`Found a match: ${match}`)
        const issue = match.match(REGEX_NUMBER)?.[0]

        if (issue) {
          // e.g. ownerRepoMatches = [ 'https://github.com/owner/repo/issues/11', 'owner', 'repo' ]
          const ownerRepoMatches = match.match(REGEX_OWNER_REPO)

          const [owner, repository] = this.getOwnerAndRepository(ownerRepoMatches?.[1], ownerRepoMatches?.[2])

          core.debug(`Owner, repository and issue: ${owner}/${repository} ${issue}`)

          issues[issue] = { issue, owner, repository }
        }
      }
    }

    return issues
  }

  private getOwnerAndRepository = (issueOwner?: string, issueRepository?: string): (string | null)[] => {
    const [owner, repository] = process.env.GITHUB_REPOSITORY!.split('/')
    // If the issue's owner and repo is the same as the one that runs this actions, only display the issue number
    // e.g. display '#13' instead of 'owner/repo/#14'
    if (!issueOwner || !issueRepository || (issueOwner === owner && issueRepository === repository)) {
      return [null, null]
    }

    return [issueOwner, issueRepository]
  }
}
