import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import 'bluebird-global'

const create = async () => {
  const sshFolder = path.join(process.env.HOME, '.ssh')

  fs.mkdirSync(sshFolder, { recursive: true, mode: 0o700 })

  const hostInfo: string = await Promise.fromCallback((cb) =>
    exec(`ssh-keyscan -H "${process.env.INPUT_HOST || 'github.com'}"`, cb)
  )

  fs.writeFileSync(path.join(sshFolder, 'known_hosts'), hostInfo, { mode: 0o644, flag: 'a' })
  fs.writeFileSync(path.join(sshFolder, 'id_rsa'), process.env.INPUT_SSH_KEY, { mode: 0o400, flag: 'wx' })
}
create()
