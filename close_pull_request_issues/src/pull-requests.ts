import * as core from '@actions/core'
import * as github from '@actions/github'
import { exec } from 'child_process'
import { PromiseFromCallback } from './utils'

interface Issue {
  issue: number
  owner: string | null
  repo: string | null
}

// Extracts anything that matches '#xxxx' where x is a number
const PULL_REQUEST_NUMBER_REGEX = /#[1-9]\d*?\b/g
const RELEASE_BRANCHES = 'release/'
const RELEASE_TITLE_REGEX = /^chore\(.*\): v.*/
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

export class PullRequest {
  private pullRequestNumbers: number[] = []
  private issues: Set<Issue> = new Set()
  private token = core.getInput('token')
  private octokit: ReturnType<typeof github.getOctokit>
  private owner: string
  private repo: string

  constructor() {
    this.octokit = github.getOctokit(this.token)

    const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/')
    this.owner = owner
    this.repo = repo
  }

  listPullRequests = async (previousTag: string, newTag: string) => {
    const prTitles = await PromiseFromCallback<string>((cb) =>
      exec(`git --no-pager log --pretty=format:%s ${previousTag}..${newTag}`, cb)
    )

    const extractedPullRequests = prTitles.match(PULL_REQUEST_NUMBER_REGEX)
    if (!extractedPullRequests) {
      throw new Error('No pull request number could be extracted from the git history')
    }

    this.pullRequestNumbers = extractedPullRequests.map((p) => Number(p.replace('#', '')))
  }

  getIssues = async () => {
    for (const pull_number of this.pullRequestNumbers) {
      try {
        const pr = await this.octokit.rest.pulls.get({
          owner: this.owner,
          repo: this.repo,
          pull_number
        })

        const branch = pr.data.head.ref
        const title = pr.data.title
        const description = pr.data.body
        // Skip in case the PR description is empty or if it's a release PR
        if (!description || branch.includes(RELEASE_BRANCHES) || title.match(RELEASE_TITLE_REGEX)) {
          continue
        }

        const issues = this.extractIssues(description)

        if (Object.keys(issues).length) {
          core.info(`(#${pull_number}) Pull Request: Found issues: ${JSON.stringify(issues, undefined, 4)}`)
          for (const issue of issues) {
            this.issues.add(issue)
          }
        }
      } catch (err) {
        core.error(`(#${pull_number}) Pull Request does not exists ${err}`)
      }
    }
  }

  closeIssues = async (comment?: string) => {
    for (const issue of this.issues) {
      const owner = issue.owner || this.owner
      const repo = issue.repo || this.repo
      const issue_number = issue.issue

      try {
        if (comment && comment.length > 0) {
          core.info(`(${owner}/${repo}#${issue_number}) Adding a comment before closing the issue`)
          /* await this.octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number,
            body: comment
          }) */
        }

        core.info(`(${owner}/${repo}#${issue_number}) Closing the issue`)
        await this.octokit.rest.issues.update({
          owner,
          repo,
          issue_number,
          state: 'closed'
        })
      } catch (err) {
        core.info(`Error occurred while commenting and closing issue (${owner}/${repo}#${issue_number}): ${err}`)
      }
    }
  }

  private extractIssues = (description: string): Issue[] => {
    const issues: Issue[] = []

    const relevantLines = description.split('\n').filter((line) => CLOSES_ISSUES_KEYWORDS_REGEX.test(line))

    for (const line of relevantLines) {
      const matches = line.match(REGEX_ISSUES) || []

      for (const match of matches) {
        core.info(`Found a match: ${match}`)
        const issue = match.match(REGEX_NUMBER)?.[0]

        if (issue) {
          // e.g. ownerRepoMatches = [ 'https://github.com/owner/repo/issues/11', 'owner', 'repo' ]
          const ownerRepoMatches = match.match(REGEX_OWNER_REPO)

          const [owner, repo] = this.getOwnerAndRepository(ownerRepoMatches?.[1], ownerRepoMatches?.[2])

          core.info(`Owner, repository and issue: ${owner}/${repo} ${issue}`)

          issues.push({ issue: Number(issue), owner, repo })
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
