import * as core from '@actions/core'
import fs from 'fs'
import { join } from 'path'

const path = core.getInput('path')
const subname = core.getInput('subname')
// GITHUB_REF is always defined inside the CI
const ref = process.env.GITHUB_REF!

if (!path) {
  core.error('Missing value for path param')
  process.exit(1)
}

if (!fs.existsSync(path)) {
  core.error("Path doesn't exist")
  process.exit(1)
}

const branchWithoutHead = ref.replace('refs/heads/', '')
const branchName = branchWithoutHead.replace(/[\W_]+/g, '_')

const subName = subname || branchName

for (const fileName of fs.readdirSync(path)) {
  const [name, _version, platform, arch] = fileName.split('-')
  const newName = `${name}-${subName}-${platform}-${arch}`

  fs.renameSync(join(path, fileName), join(path, newName))
}
