export const BASE_PATH = process.env.INPUT_PATH || process.env.GITHUB_WORKSPACE
export const WHITELISTED_SECTIONS = ['', '### Bug Fixes', '### Features']

export const removeDuplicates = (changelog: string, previousVersion: string) => {
  const prevVersionMark = previousVersion.endsWith('0') ? `# [${previousVersion}]` : `## [${previousVersion}]`
  const preVersionIdx = changelog.indexOf(prevVersionMark)

  const newLines = changelog.slice(0, preVersionIdx).split('\n')
  const prevContent = changelog.slice(preVersionIdx)

  const finalNewLines = newLines
    .map((l) => (WHITELISTED_SECTIONS.includes(l) || !prevContent.includes(l)) && l)
    .filter((l) => typeof l === 'string')
    .join('\n')

  return finalNewLines
}
