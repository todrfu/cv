import { program } from 'commander'
import YoScript from '../scripts/yo'

export default class Yeoman {
  static cmd = 'yo'
  static description = 'Create a cv template'
  dir: DirectoryInfo

  constructor(dir: DirectoryInfo) {
    this.dir = dir
  }

  register() {
    program
      .command(Yeoman.cmd)
      .argument('<projectName>', 'name of the project')
      .description(Yeoman.description)
      .action(this.action.bind(this))
  }
  action(projectName: string) {
    const commander = new YoScript()
    commander.start(this.dir, {
      projectName
    })
  }
}
