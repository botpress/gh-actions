import changelog from 'conventional-changelog'

type ChangelogParameters = Parameters<typeof changelog>
export type Options = ChangelogParameters[0]
export type Context = ChangelogParameters[1]
export type GitRawCommitsOptions = ChangelogParameters[2]
export type CommitsParserOpts = ChangelogParameters[3]
export type ChangelogWriterOpts = ChangelogParameters[4]

interface Issue {
  issue: string
  owner?: string
  repository?: string
}

export type PullRequestIssues = {
  [pullRequest: number]: ExtractedIssues
}

export type ExtractedIssues = {
  [issue: string]: Issue
}
