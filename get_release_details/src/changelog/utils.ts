export const WHITELISTED_SECTIONS = ['', '### Bug Fixes', '### Features']

/**
 * This function removes duplicates to the changelog of the latest version in a list of changelogs
 *
 * *Note: It does not remove duplicates if there is any inside the changelog of the latest version*
 *
 * @param changelog The complete changelog to search duplicates on
 * @param previousVersion The version before the latest version contained in the changelog
 * @returns The latest changelog without duplicates
 */
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
