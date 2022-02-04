import * as core from '@actions/core'
import * as github from '@actions/github'
import semver from 'semver'

export const getChangelogs = async (repo: string, versions: string[]) => {
  const token = core.getInput('token')
  const [owner, _] = process.env.GITHUB_REPOSITORY!.split('/')
  const [oldVersion, newVersion] = versions

  const changelogs: string[] = []
  const octokit = github.getOctokit(token)
  const releases = await octokit.request('GET /repos/{owner}/{repo}/releases', {
    owner,
    repo
  })

  // TODO: If sorted break once we hit a version that does not match
  for (const release of releases.data) {
    core.info(`release tag: ${release.tag_name}`)
    if (release.prerelease || release.draft) {
      continue
    }

    // Cases
    // 1.0.0 -> 1.0.1
    if (release.body && semver.satisfies(release.tag_name, `>${oldVersion} <=${newVersion}`)) {
      changelogs.push(release.body)
    }
  }

  return changelogs
}
