import path from 'node:path'
import fs from 'node:fs'
import ora from 'ora'
import chalk from 'chalk'
import Base from './base'
import { CLI_NAME } from '../const'

const { red, cyan } = chalk

const LOG_MODULE = '[yeoman]'

export default class Yo extends Base {
  pkgName: string = ''
  dir: DirectoryInfo | null = null

  constructor() {
    super()
  }

  start(dir: DirectoryInfo, args: Record<string, string>) {
    this.dir = dir
    if (!args.projectName) {
      console.log(red(`${LOG_MODULE} Please specify the template name，eg: ${CLI_NAME} yo xxx `))
      process.exit(1)
    }
    this.pkgName = args.projectName
    this.installTemplate()
  }
  /**
   * Install yeoman template
   */
  async installTemplate() {
    const loadSpinner = ora(`${LOG_MODULE} Initializing the Yeoman template`).start()

    // Download directory, "/" will be divided into folders
    const projectPath = path.join(process.cwd(), this.pkgName.replace('/', '-'))
    loadSpinner.start()

    try {

      // copy generator-template
      const generatorTemplatePath = path.join(__dirname, '../../generators/generator-template')

      // rename
      fs.cpSync(generatorTemplatePath, projectPath, { recursive: true })

      loadSpinner.succeed()

      console.log(cyan(`\n${LOG_MODULE} Yeoman template has been initialized successfully`))

      await this.logCV()
    } catch (err) {
      loadSpinner.fail()
      console.log(red(`${LOG_MODULE} Initialization failed. ${err}`))
    }
  }
}
