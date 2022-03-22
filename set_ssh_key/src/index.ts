import * as core from '@actions/core'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

const create = async () => {
  const host = core.getInput('host')
  const sshKey = core.getInput('ssh_key', { required: true })
  // HOST is necessarily defined when running in the CIs
  const home = process.env.HOME!

  const sshFolder = path.join(home, '.ssh')

  fs.mkdirSync(sshFolder, { recursive: true, mode: 0o700 })

  const hostInfo = await new Promise<string>((resolve, reject) =>
    exec(`ssh-keyscan -H "${host}"`, (err, res) => {
      if (err) {
        reject(err)
      } else if (res) {
        resolve(res)
      }
    })
  )

  fs.writeFileSync(path.join(sshFolder, 'known_hosts'), hostInfo, { mode: 0o644, flag: 'a' })
  fs.writeFileSync(path.join(sshFolder, 'id_rsa'), sshKey, { mode: 0o400, flag: 'wx' })
}

void create()
