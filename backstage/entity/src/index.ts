import * as core from '@actions/core'
import { dirname, join } from 'path'

import { putObject } from './aws'
import { decode } from './entity'
import { readFile } from './file'

const main = async () => {
  const source = core.getInput('source')
  const bucket = core.getInput('bucket')

  const data = readFile(source)
  const [schema, entities] = decode(data)

  for (const entity of entities) {
    await putObject(bucket, `catalog/${entity.path()}`, entity.yaml())
  }

  const sourceDirectory = dirname(source)
  core.setOutput('docs-source', schema.docs ? join(sourceDirectory, schema.docs) : '')

  const mainEntity = entities[0]
  core.setOutput('docs-reference', mainEntity.doc())
}

main().catch(core.setFailed)
