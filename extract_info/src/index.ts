const { INPUT_BRANCH, GITHUB_REF } = process.env

// GITHUB_REF is necessarily defined when running this on Github Actions
const branchWithoutHead = (INPUT_BRANCH || GITHUB_REF!).replace('refs/heads/', '')
const branchName = branchWithoutHead.replace(/[\W_]+/g, '_')

console.log(`::set-output name=branch::${branchWithoutHead}`)
console.log(`::set-output name=branch_sanitized::${branchName}`)
