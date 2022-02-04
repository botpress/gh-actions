import { exec } from 'child_process'
import { PromiseFromCallback, REPOS } from './utils'

export const getVersionsRange = async (tags: string[]): Promise<{ [repo: string]: string[] }> => {
  const ranges: { [repo: string]: string[] } = REPOS.reduce((a, r) => ({ ...a, [r]: [] }), {})

  for (const tag of tags) {
    const strPkg = await PromiseFromCallback<string>((cb) => exec(`git show ${tag}:package.json`, cb))
    const pkg = JSON.parse(strPkg)

    for (const repo of REPOS) {
      const version = pkg?.[repo]?.['version'] as string | undefined

      // Scenarios
      // [X] 1. Version stays the same (e.g. 1.0.0 -> 1.0.0)
      // [X] 2. Version bump (e.g. 1.0.0 -> 1.1.1)
      // [X] 3. Version downgrade (e.g. 1.1.1 -> 1.0.0)
      // [X] 4. Version does not exists (e.g. undefined -> undefined)
      if (!version || (ranges[repo].length === 1 && ranges[repo][0] <= version)) {
        ranges[repo] = []

        continue
      }

      ranges[repo].push(version)
    }
  }

  // Scenarios
  // [X] 5. Version does not exists (e.g. 1.0.0 -> undefined)
  // [X] 6. Version does not exists (e.g. undefined -> 1.1.1)
  Object.keys(ranges).forEach((r) => (ranges[r].length <= 1 ? (ranges[r] = []) : undefined))

  return ranges
}
