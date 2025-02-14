import { program } from 'commander'
import InstallScript from '../scripts/install'

export default class Install {
  static cmd = 'install'
  static alias = 'i'
  static description = 'Install a cv template'
  dir: DirectoryInfo

  constructor(dir: DirectoryInfo) {
    this.dir = dir
  }

  register() {
    program
      .command(Install.cmd)
      .alias(Install.alias)
      .argument('<pkgName>', 'git url or name package of the template')
      .description(Install.description)
      .action(this.action.bind(this))
  }

  action(pkgName: string) {
    const commander = new InstallScript()
    commander.start(this.dir, { pkgName })
  }
}
