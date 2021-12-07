export const removeDuplicates = (changelog: string, previousVersion: string) => {
  const whitelist = ['', '### Bug Fixes', '### Features']
  const prevVersionMark = previousVersion.endsWith('0') ? `# [${previousVersion}]` : `## [${previousVersion}]`
  const preVersionIdx = changelog.indexOf(prevVersionMark)

  const newLines = changelog.slice(0, preVersionIdx).split('\n')
  const prevContent = changelog.slice(preVersionIdx)

  const finalNewLines = newLines
    .map((l) => (whitelist.includes(l) || !prevContent.includes(l)) && l)
    .filter((l) => typeof l === 'string')
    .join('\n')

  return finalNewLines
}
