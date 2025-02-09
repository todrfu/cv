import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import chalk from 'chalk'
import inquirer from 'inquirer'
import importFrom from 'import-from'
import { createEnv } from 'yeoman-environment'

import ScriptBase from 'src/baseScript'
import { NPM_REGISTRY, TEMPLATE_DIR } from 'src/const'
import { getInstalledStatus, getInstalledGenerators } from 'src/shared/package'
import { readJson } from 'src/shared/index'

const { cyan, green, yellow, red } = chalk

import Install from './install'

const LOG_MODULE = green('[create project]')

const yoemanEnv = createEnv()

type PromptAnswer = {
  tplName: string
  newPkgName: string
}

const helpMessage = `\
Usage: cv create [OPTION]

Create a new cv project or template.

Options:
  -t       xxxxx
`

export default class Create implements ScriptBase {
  dir: DirectoryInfo

  constructor({ dir }: { pkgName: string; dir: DirectoryInfo }) {
    this.dir = dir
  }

  static helpMessage = () => helpMessage

  async start() {
    const generators = this.genLocalGenerators(TEMPLATE_DIR)

    if (!generators.length) {
      console.log(yellow(`${LOG_MODULE} There are no templates installed.`))
      process.exit(1)
    }

    const { tplName, newPkgName } = await inquirer.prompt<PromptAnswer>(this.generatePrompts(generators))
    if (!tplName) {
      process.exit(1)
    }

    // await this.checkTemplateVersion(tplName)

    if (tplName === '__ADD_NEW') {
      const installIns = new Install({ pkgName: newPkgName, dir: this.dir })
      installIns.start()
      process.exit(0)
    }

    // install dependencies when the template is not installed
    this.prepareChoosedTplDep(TEMPLATE_DIR, tplName)

    try {
      this.yoemanRegister(TEMPLATE_DIR, tplName)
    } catch(err) {
      console.log(red(`${LOG_MODULE} This template has some error \n\n ${err}`))
    }
  }
  prepareChoosedTplDep(generatorsPath: string, tplName: string) {
    const hasInstallDep = path.join(generatorsPath, `./${tplName}/node_modules`)
    if (!fs.existsSync(hasInstallDep)) {

      console.log(yellow(`${LOG_MODULE} The template is used for the first time, it needs to install dependencies, please wait a moment...`))

      execSync(`npm i --registry=${NPM_REGISTRY}`, {
        cwd: path.join(generatorsPath, `./${tplName}`),
        stdio: 'inherit'
      })

      console.log(cyan(`${LOG_MODULE} Dependencies installed successfully.`))
    }
  }
  /**
   * register generator
   * @param generatorsPath generators path
   * @param tplName template name
   */
  async yoemanRegister(generatorsPath: string, tplName: string) {
    const tplPkg = importFrom(generatorsPath, `./${tplName}`)
    if (tplPkg) {
      yoemanEnv.register(path.join(generatorsPath, `./${tplName}`), tplName)
      await yoemanEnv.run(tplName)
      console.log(cyan(`${LOG_MODULE} Congratulations, the project has been initialized successfully.`))
    }
  }
  /**
   * local default templates
   */
  genLocalGenerators(generatorsPath: string) {
    // filter folder
    const generators: string[] = fs.readdirSync(generatorsPath).filter((item) => fs.statSync(path.join(generatorsPath, `./${item}`)).isDirectory())
    return generators.reduce((acc: Array<{ name: string; value: string }>, cur) => {
      const json = readJson(path.join(generatorsPath, `./${cur}/package.json`))
      acc.push({
        name: json.description,
        value: cur,
      })
      return acc
    }, [])
  }
  /**
   * Get the description information of the currently installed template,
   * which is used to prompt the user to select the corresponding template during initialization.
   * @param targetDir template folder
   * @returns
   */
  getGenerators(targetDir: string): Array<Record<string, string>> {
    if (!this.hasTemplatesFolder()) {
      return []
    }
    const generators = getInstalledGenerators(targetDir) || {}
    return Object.keys(generators).map((key) => {
      const pkg = require(path.resolve(targetDir, `node_modules/${key}/package.json`))
      return {
        name: pkg.description,
        value: key,
      }
    }, [])
  }
  /**
   * Check whether in the template folder is existed
   */
  hasTemplatesFolder() {
    let rst = false
    try {
      fs.readdirSync(path.join(this.dir.tpl, './templates'))
    } catch (err) {
      rst = true
    }
    return rst
  }
  /**
   * Generate a conversation
   */
  generatePrompts(generators: ReturnType<typeof this.getGenerators>) {
    return [
      {
        message: 'Please select a template:',
        type: 'list',
        name: 'tplName',
        choices: generators.concat([
          {
            name: `Don't have the template you want? Install a new template now?\n`,
            value: '__ADD_NEW',
          },
        ]),
      },
      {
        message: 'Please enter git url:',
        type: 'input',
        name: 'newPkgName',
        when: (answers: PromptAnswer) => answers.tplName === '__ADD_NEW',
      },
    ]
  }
  /**
   * Check whether the template is up to date
   * @param tplName template name
   */
  async checkTemplateVersion(tplName: string) {
    const status = getInstalledStatus(tplName, this.dir.tpl)
    if (status !== 2) {
      const { needUpdate } = await inquirer.prompt({
        message: 'This template has a new version. Do you want to update it?',
        type: 'list',
        name: 'needUpdate',
        choices: ['yes', 'no'],
      })
      if (needUpdate === 'yes') {
        const installIns = new Install({ pkgName: tplName, dir: this.dir })
        installIns.start()
      }
    }
  }
}
