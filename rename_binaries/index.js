const fs = require('fs')
const path = require('path')

const { INPUT_PATH, GITHUB_REF } = process.env

if (!fs.existsSync(INPUT_PATH)) {
  console.error("Path doesn't exist")
  process.exit(1)
}

const branchName = GITHUB_REF.replace('refs/heads/', '').replace(/[\W_]+/g, '_')

for (const fileName of fs.readdirSync(INPUT_PATH)) {
  const [name, _version, platform, arch] = fileName.split('-')
  const newName = `${name}-${branchName}-${platform}-${arch}`

  fs.renameSync(path.join(INPUT_PATH, fileName), path.join(INPUT_PATH, newName))
}
