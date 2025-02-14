import chalk from 'chalk'
import { platform } from 'os'
import { printFiglet } from '../shared'
import pkg from '../../package.json'

const { green } = chalk
export default class BaseScript {
  static os = platform()
  constructor() {}
  async logCV() {
    const figletText = await printFiglet(pkg.description)
    console.log(green(figletText))
  }
}
