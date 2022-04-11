import 'bluebird-global'

import * as core from '@actions/core'

import { putObject } from './aws'
import { decode } from './entities'
import { readFile } from './file'

const main = async () => {
  const source = core.getInput('source')
  const bucket = core.getInput('bucket')

  const data = readFile(source)
  const entities = decode(data)

  for (const entity of entities) {
    await putObject(bucket, `catalog/${entity.path()}`, entity.yaml())
  }
}

main().catch(core.setFailed)
