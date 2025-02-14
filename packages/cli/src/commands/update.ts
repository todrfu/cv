import { program } from 'commander'
import UpdateScript from '../scripts/update'

export default class Update {
  static cmd = 'update'
  static description = 'Update cv'
  dir: DirectoryInfo

  constructor(dir: DirectoryInfo) {
    this.dir = dir
  }

  register() {
    program
      .command(Update.cmd)
      .description(Update.description)
      .action(this.action.bind(this))
  }
  action() {
    const commander = new UpdateScript()
    commander.start()
  }
}
