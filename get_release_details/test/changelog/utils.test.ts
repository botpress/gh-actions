import { removeDuplicates, WHITELISTED_SECTIONS } from '../../src/changelog/utils'

const currentVersion = '0.0.40'
const changelogsWithDuplicated = `
## [0.0.41](https://github.com/botpress/studio/compare/v0.0.28...v0.0.41) (2021-10-22)


### Bug Fixes

* **qna:** fix context search in QnA ([#141](https://github.com/botpress/studio/issues/141)) ([f8bacf3](https://github.com/botpress/studio/commit/f8bacf355d122e6a6e7edc60c951468f71f96fea))
* **studio:** ignore proxy when calling core ([#142](https://github.com/botpress/studio/issues/142)) ([cf44e91](https://github.com/botpress/studio/commit/cf44e913b23005da2f25b391b1b73d407d9d16c5))
* **studio:** ignore proxy when calling core ([#142](https://github.com/botpress/studio/issues/142)) ([cf44e91](https://github.com/botpress/studio/commit/cf44e913b23005da2f25b391b1b73d407d9d16c5))
* always display search bar on qna ([#136](https://github.com/botpress/studio/issues/136)) ([0220da2](https://github.com/botpress/studio/commit/0220da24965daa3b1e35a4599e7d14e82229a4dc))
* always display search bar on qna ([#136](https://github.com/botpress/studio/issues/136)) ([0220da2](https://github.com/botpress/studio/commit/0220da24965daa3b1e35a4599e7d14e82229a4dc))
* always display search bar on qna ([#136](https://github.com/botpress/studio/issues/136)) ([0220da2](https://github.com/botpress/studio/commit/0220da24965daa3b1e35a4599e7d14e82229a4dc))
* always display search bar on qna ([#136](https://github.com/botpress/studio/issues/136)) ([0220da2](https://github.com/botpress/studio/commit/0220da24965daa3b1e35a4599e7d14e82229a4dc))


# [0.0.40](https://github.com/botpress/studio/compare/v0.0.39...v0.0.40) (2021-10-18)


### Bug Fixes

* **qna:** fix context search in QnA ([#141](https://github.com/botpress/studio/issues/141)) ([f8bacf3](https://github.com/botpress/studio/commit/f8bacf355d122e6a6e7edc60c951468f71f96fea))
* always display search bar on qna ([#136](https://github.com/botpress/studio/issues/136)) ([0220da2](https://github.com/botpress/studio/commit/0220da24965daa3b1e35a4599e7d14e82229a4dc))

`

describe('RemoveChangelogDuplicates', () => {
  test('it should remove all duplicates from a changelog', (done) => {
    const lines: { [line: string]: boolean } = {}
    const index = changelogsWithDuplicated.indexOf(currentVersion)
    const oldChangelog = changelogsWithDuplicated.substring(index)

    const changelogs = removeDuplicates(changelogsWithDuplicated, currentVersion)

    for (const line of `${changelogs}${oldChangelog}`.split('\n')) {
      if (WHITELISTED_SECTIONS.includes(line)) {
        continue
      }

      if (lines[line]) {
        done(new Error(`Duplicate found here: ${line}`))
      } else {
        lines[line] = true
      }
    }

    done()
  })
})
