import fse from 'fs-extra'
import path from 'path'
import _ from 'lodash'

const fullPath = path.join(process.env.GITHUB_WORKSPACE, process.env.INPUT_PATH)
const parsedJson = JSON.parse(process.env.INPUT_JSON)

if (fse.pathExistsSync(process.env.INPUT_PATH)) {
  const content = fse.readJsonSync(fullPath)

  fse.writeJsonSync(fullPath, _.merge(content, parsedJson), { spaces: 2 })

  console.info(`Updated json file ${fullPath}`)
} else {
  fse.writeJsonSync(fullPath, parsedJson, { spaces: 2 })
  console.info(`Created json file ${fullPath}`)
}
