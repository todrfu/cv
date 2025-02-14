import { program } from 'commander'
import pkg from '../../package.json'

export default class Version {
  static cmd = 'version'
  static alias = 'v'
  static description = 'Get version'
  dir: DirectoryInfo

  constructor(dir: DirectoryInfo) {
    this.dir = dir
  }

  register() {
    program.version(pkg.version, `-${Version.alias}, --${Version.cmd}`)
  }

  action() {
    console.log(pkg.version)
  }
}
