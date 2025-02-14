import chalk from 'chalk'
import semver from 'semver'
import { exec, execSync } from 'node:child_process'
import Base from './base'
import pkg from '../../package.json'

const { green, red } = chalk

const LOG_MODULE = '[update]'

export default class Update extends Base {
  constructor() {
    super()
  }

  async start() {
    const { version: currentVersion, name } = pkg
    const latestVersion = execSync(`npm view ${name} version`).toString().trim()

    if (semver.lt(currentVersion, latestVersion)) {
      exec(`npm install -g ${name}@${latestVersion}`, async (err, stdout, stderr) => {
        // no permission
        if (stderr.includes('EACCES')) {
          if (Update.os === 'win32') {
            console.log(red(`${LOG_MODULE} Please run the command with admin`))
          } else if (Update.os === 'darwin' || Update.os === 'linux') {
            console.log(red(`${LOG_MODULE} Please run the command with sudo`))
          }
        } else {
          console.log(`\n${LOG_MODULE} ${green(`${name} is updated to the latest version`)}`)
          await this.logCV()
        }
      })
    } else {
      console.log(`${LOG_MODULE} ${green(`${name} is up to date`)}`)
      await this.logCV()
    }
  }
}
