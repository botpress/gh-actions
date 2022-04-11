import * as core from '@actions/core'

import { setup } from './setup'

const main = async () => {
  const source = core.getInput('source')
  setup(source)
}

main().catch(core.setFailed)
