import * as core from '@actions/core'

import { setup } from './setup'

const main = async () => {
  const source = core.getInput('source', { required: true })
  setup(source)
}

main().catch(core.setFailed)
