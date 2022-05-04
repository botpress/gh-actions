import * as core from '@actions/core'
import chalk from 'chalk'
import { dirname, join } from 'path'

import { putObject } from './aws'
import { decode } from './entity'
import { readFile } from './file'

const main = async () => {
  const source = core.getInput('source', { required: true })
  const bucket = core.getInput('bucket', { required: true })

  core.info(`Reading backstage source file ${chalk.blue(source)}`)
  const data = readFile(source)

  core.info('Decoding backstage source file')
  const [schema, entities] = decode(data, source)

  for (const entity of entities) {
    const key = `catalog/${entity.path()}`
    core.info(`Uploading entity ${chalk.blue(entity.ref())} to key ${chalk.blue(key)}`)
    await putObject(bucket, key, entity.yaml())
  }

  const sourceDirectory = dirname(source)
  core.setOutput('docs-source', schema.docs ? join(sourceDirectory, schema.docs) : '')

  const mainEntity = entities[0]
  core.setOutput('docs-reference', mainEntity.doc())
}

main().catch(core.setFailed)
