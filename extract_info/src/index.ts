const branchWithoutHead = process.env.GITHUB_REF.replace('refs/heads/', '')
const branchName = branchWithoutHead.replace(/[\W_]+/g, '_')

console.log(`::set-output name=branch::${branchWithoutHead}`)
console.log(`::set-output name=branch_sanitized::${branchName}`)
