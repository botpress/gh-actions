import * as core from '@actions/core'

const branch = core.getInput('branch')
// GITHUB_REF is always defined inside the CI
const ref = process.env.GITHUB_REF!

const branchWithoutHead = (branch || ref).replace('refs/heads/', '')
const branchName = branchWithoutHead.replace(/[\W_]+/g, '_')

core.setOutput('branch', branchWithoutHead)
core.setOutput('branch_sanitized', branchName)
