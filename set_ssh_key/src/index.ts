import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

const create = async () => {
  const sshFolder = path.join(process.env.HOME!, '.ssh')

  fs.mkdirSync(sshFolder, { recursive: true, mode: 0o700 })

  const hostInfo = await new Promise<string>((resolve, reject) =>
    exec(`ssh-keyscan -H "${process.env.INPUT_HOST || 'github.com'}"`, (err, res) => {
      if (err) {
        reject(err)
      } else if (res) {
        resolve(res)
      }
    })
  )

  fs.writeFileSync(path.join(sshFolder, 'known_hosts'), hostInfo, { mode: 0o644, flag: 'a' })
  fs.writeFileSync(path.join(sshFolder, 'id_rsa'), process.env.INPUT_SSH_KEY, { mode: 0o400, flag: 'wx' })
}
create()
