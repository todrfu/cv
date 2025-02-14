import { program } from 'commander'
import CreateScript from '../scripts/create'

export default class Create {
  static cmd = 'create'
  static alias = 'c'
  static description = 'Create a new project'
  dir: DirectoryInfo

  constructor(dir: DirectoryInfo) {
    this.dir = dir
  }

  register() {
    program
      .command(Create.cmd)
      .alias(Create.alias)
      .description(Create.description)
      .action(this.action.bind(this))
  }
  action() {
    const commander = new CreateScript()
    commander.start(this.dir)
  }
}
