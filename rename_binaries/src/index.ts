import fs from 'fs'
import path from 'path'

const { INPUT_PATH, GITHUB_REF } = process.env

if (!fs.existsSync(INPUT_PATH)) {
  console.error("Path doesn't exist")
  process.exit(1)
}

const branchWithoutHead = GITHUB_REF.replace('refs/heads/', '')
const branchName = branchWithoutHead.replace(/[\W_]+/g, '_')

console.log(`::set-output name=branch::${branchWithoutHead}`)
console.log(`::set-output name=branch_sanitized::${branchName}`)

for (const fileName of fs.readdirSync(INPUT_PATH)) {
  const [name, _version, platform, arch] = fileName.split('-')
  const newName = `${name}-${branchName}-${platform}-${arch}`

  fs.renameSync(path.join(INPUT_PATH, fileName), path.join(INPUT_PATH, newName))
}
