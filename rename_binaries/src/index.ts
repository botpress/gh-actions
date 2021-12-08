import fs from 'fs'
import path from 'path'

const { INPUT_PATH, INPUT_SUBNAME, GITHUB_REF } = process.env

if (!fs.existsSync(INPUT_PATH)) {
  console.error("Path doesn't exist")
  process.exit(1)
}

const branchWithoutHead = GITHUB_REF.replace('refs/heads/', '')
const branchName = branchWithoutHead.replace(/[\W_]+/g, '_')

const subName = INPUT_SUBNAME || branchName

for (const fileName of fs.readdirSync(INPUT_PATH)) {
  const [name, _version, platform, arch] = fileName.split('-')
  const newName = `${name}-${subName}-${platform}-${arch}`

  fs.renameSync(path.join(INPUT_PATH, fileName), path.join(INPUT_PATH, newName))
}
