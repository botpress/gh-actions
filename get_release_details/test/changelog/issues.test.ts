import { Transformer } from '../../src/changelog/issues'
import { TransformCommit, TransformContext } from '../../src/changelog/types'

const responseMock = jest.fn()
jest.mock('@actions/github', () => {
  return {
    getOctokit: jest.fn().mockReturnValue({
      rest: {
        pulls: {
          get: async () => responseMock()
        }
      }
    })
  }
})

const OWNER = 'test'
const REPO = 'test'
const EXTERNAL_OWNER = 'external'
const EXTERNAL_REPO = 'external'
const PR_NUMBER_1 = '41'
const ISSUE_NUMBER_1 = '40'
const ISSUE_NUMBER_2 = '355'
const CHORE_PR_NUMBER = '12'
const ISSUE_1 = `#${ISSUE_NUMBER_1}`
const ISSUE_2 = `https://github.com/${OWNER}/${REPO}/issues/${ISSUE_NUMBER_2}`
const ISSUE_3 = `https://github.com/${EXTERNAL_OWNER}/${EXTERNAL_REPO}/issues/${ISSUE_NUMBER_2}`
const COMMIT: TransformCommit = {
  type: 'fix',
  scope: null,
  subject: `super important bug (#${PR_NUMBER_1})`,
  id: null,
  source: null,
  merge: null,
  header: `fix: super important bug (#${PR_NUMBER_1})`,
  body: null,
  footer: null,
  notes: [] as any,
  references: [
    {
      action: null,
      owner: null,
      repository: null,
      issue: `${PR_NUMBER_1}`,
      raw: `fix: super important bug (#${PR_NUMBER_1}`,
      prefix: '#'
    },
    {
      action: null,
      owner: null,
      repository: null,
      issue: '',
      raw: 'some random commit',
      prefix: ''
    },
    {
      action: null,
      owner: null,
      repository: null,
      issue: '',
      raw: 'another random commit',
      prefix: ''
    }
  ] as any,
  mentions: [] as any,
  revert: null,
  hash: '661c278c7e7168322d8f07e261f2da87a90f4b4b',
  gitTags: ' (HEAD -> main, origin/main)',
  committerDate: '2022-01-24'
}
const CHORE_COMMIT: TransformCommit = JSON.parse(JSON.stringify(COMMIT))
CHORE_COMMIT.type = 'chore'
CHORE_COMMIT.references[0].issue = CHORE_PR_NUMBER
const CONTEXT: TransformContext = {
  commit: 'commit',
  issue: 'issues',
  date: '2022-01-24',
  version: '0.0.5',
  host: 'https://github.com',
  owner: OWNER,
  repository: REPO,
  repoUrl: 'https://github.com',
  packageData: {
    name: REPO,
    version: '0.0.5',
    main: 'index.js',
    scripts: {},
    repository: {
      type: 'git',
      url: `git+https://github.com/${OWNER}/${REPO}.git`
    },
    license: 'ISC',
    bugs: {
      url: `https://github.com/${OWNER}/${REPO}/issues`
    },
    homepage: `https://github.com/${OWNER}/${REPO}#readme`,
    readme: 'ERROR: No README data found!',
    _id: 'test@0.0.5'
  },
  gitSemverTags: ['v0.0.4', 'v0.0.3', 'v0.0.2', 'v0.0.1'],
  linkReferences: true
}
const RESPONSE = {
  data: {
    body: `This is a PR description\n\nIt closes ${ISSUE_1}, ${ISSUE_1}, ${ISSUE_1}\nPlus resolves ${ISSUE_2} and ${ISSUE_3}`,
    head: {
      ref: 'not_a_release_branch'
    },
    title: 'feat(something): does something'
  }
}
const RESPONSE_2 = {
  data: {
    body: `This is a PR description\n\nIt closes ${ISSUE_1}`,
    head: {
      ref: 'release/v0.0.5'
    },
    title: 'fix(something): fixes something'
  }
}
const RESPONSE_3 = {
  data: {
    body: 'This is a PR description\nCloses nothing',
    head: {
      ref: 'not_a_release_branch_2'
    }
  }
}
const PULL_REQUEST_ISSUES = {
  [PR_NUMBER_1]: {
    [ISSUE_NUMBER_2]: { issue: ISSUE_NUMBER_2, owner: EXTERNAL_OWNER, repository: EXTERNAL_OWNER },
    [ISSUE_NUMBER_1]: { issue: ISSUE_NUMBER_1, owner: null, repository: null }
  }
}

describe('Issues - Transformer', () => {
  let transformer: Transformer

  test('should be able to instantiate a transformer without problem', () => {
    try {
      transformer = new Transformer()
    } catch (e) {
      fail(e)
    }
  })

  describe('FetchPullRequestNumbers', () => {
    test('should extract a PR number from a commit and store it for later', () => {
      const commit = transformer.fetchPullRequestNumbers(COMMIT, CONTEXT)

      expect(transformer['pullRequestNumbers']).toContain(Number(PR_NUMBER_1))
      expect(commit).toEqual(COMMIT)
    })

    test('should not extract the PR number from a commit that is a chore', () => {
      const commit = transformer.fetchPullRequestNumbers(CHORE_COMMIT, CONTEXT)

      expect(transformer['pullRequestNumbers']).not.toContain(Number(CHORE_PR_NUMBER))
      expect(commit).toEqual(false)
    })
  })

  describe('GetIssues', () => {
    const defaultEnv = { ...process.env }

    beforeAll(() => {
      process.env.GITHUB_REPOSITORY = `${OWNER}/${REPO}`
    })

    afterAll(() => {
      process.env = defaultEnv
    })

    test('should extract issue numbers from the pull requests description', async () => {
      responseMock.mockImplementationOnce(async () => RESPONSE)

      await transformer.getIssues(OWNER, REPO)

      expect(transformer['pullRequestIssues']).toEqual(PULL_REQUEST_ISSUES)
      expect(responseMock).toHaveBeenCalledTimes(1)
    })

    test('should not extract issues from the release pull request', async () => {
      responseMock.mockImplementationOnce(async () => RESPONSE_2)

      await transformer.getIssues(OWNER, REPO)

      expect(transformer['pullRequestIssues']).toEqual(PULL_REQUEST_ISSUES)
      expect(responseMock).toHaveBeenCalledTimes(1)
    })

    test('should not extract issues when the description contains none', async () => {
      responseMock.mockImplementationOnce(async () => RESPONSE_3)

      await transformer.getIssues(OWNER, REPO)

      expect(transformer['pullRequestIssues']).toEqual(PULL_REQUEST_ISSUES)
      expect(responseMock).toHaveBeenCalledTimes(1)
    })

    test('should not extract issues when there is an error fetching details of a pull request', async () => {
      responseMock.mockImplementationOnce(async () => {
        throw new Error()
      })

      await transformer.getIssues(OWNER, REPO)

      expect(transformer['pullRequestIssues']).toEqual(PULL_REQUEST_ISSUES)
      expect(responseMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('ReferenceIssues', () => {
    const defaultEnv = process.env

    beforeAll(() => {
      process.env.GITHUB_REPOSITORY = `${OWNER}/${REPO}`
    })

    afterAll(() => {
      process.env = defaultEnv
    })

    test('should properly reference issues in commits', async () => {
      const commit = transformer.referenceIssues(COMMIT, CONTEXT)

      expect(commit).not.toEqual(false)
      expect((commit as TransformCommit).references).toEqual(
        expect.arrayContaining([
          {
            action: 'closes',
            issue: ISSUE_NUMBER_1,
            owner: null,
            prefix: '#',
            raw: ISSUE_NUMBER_1,
            repository: null
          },
          {
            action: 'closes',
            issue: ISSUE_NUMBER_2,
            owner: EXTERNAL_OWNER,
            prefix: '#',
            raw: ISSUE_NUMBER_2,
            repository: EXTERNAL_REPO
          }
        ])
      )
    })

    test('should not reference issues in unwanted commits', async () => {
      const commit = transformer.referenceIssues(CHORE_COMMIT, CONTEXT)

      expect(commit).toEqual(false)
    })
  })
})
