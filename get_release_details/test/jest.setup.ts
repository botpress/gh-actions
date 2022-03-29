// Global setup is performed before a TypeScript environment is made available, so we need to create the environment manually
require('ts-node/register')

const setup = async () => {
  // Disable the logger
  const processStdoutWrite = process.stdout.write.bind(process.stdout)
  // @ts-ignore
  process.stdout.write = (str, encoding, cb) => {
    if (!str.toString().match(/^\:\:/)) {
      return processStdoutWrite(str, encoding, cb)
    }
  }
}

export default setup
