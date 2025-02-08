import path from 'node:path'
import fs from 'node:fs'
import ora from 'ora'
import chalk from 'chalk'
import { CLI_NAME } from 'src/const'
import ScriptBase from 'src/baseScript'

const { green, red } = chalk

export default class Yo implements ScriptBase {
  pkgName: string
  dir: DirectoryInfo

  constructor({ dir }: { pkgName: string; dir: DirectoryInfo }) {
    this.dir = dir
    const name = process.argv[3]
    if (!name) {
      console.log(red(`Please specify the template name，eg: ${CLI_NAME} yo xxx `))
      process.exit(1)
    }
    this.pkgName = name
  }
  start() {
    this.installTemplate()
  }
  /**
   * Install yeoman template
   */
  async installTemplate() {
    const loadSpinner = ora('Initializing the Yeoman template').start()

    // Download directory, "/" will be divided into folders
    const projectPath = path.join(process.cwd(), this.pkgName.replace('/', '-'))
    loadSpinner.start()

    try {

      // copy generator-template
      const generatorTemplatePath = path.join(__dirname, '../../generators/generator-template')

      // rename
      fs.cpSync(generatorTemplatePath, projectPath, { recursive: true })

      loadSpinner.succeed()

      console.log(green('Yeoman template has been initialized successfully'))
    } catch (err) {
      loadSpinner.fail()
      console.log(red(`Initialization failed. ${err}`))
    }
  }
}
