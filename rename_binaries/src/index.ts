import fs from 'fs'
import path from 'path'

const { INPUT_PATH, GITHUB_REF } = process.env

if (!INPUT_PATH) {
  console.error('Missing value for path param')
  process.exit(1)
}

if (!fs.existsSync(INPUT_PATH)) {
  console.error("Path doesn't exist")
  process.exit(1)
}

const branchWithoutHead = GITHUB_REF!.replace('refs/heads/', '')
const branchName = branchWithoutHead.replace(/[\W_]+/g, '_')

for (const fileName of fs.readdirSync(INPUT_PATH)) {
  const [name, _version, platform, arch] = fileName.split('-')
  const newName = `${name}-${branchName}-${platform}-${arch}`

  fs.renameSync(path.join(INPUT_PATH, fileName), path.join(INPUT_PATH, newName))
}
