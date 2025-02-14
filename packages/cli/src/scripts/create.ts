import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import chalk from 'chalk'
import inquirer from 'inquirer'
import importFrom from 'import-from'
import { createEnv } from 'yeoman-environment'

import Base from './base'
import { NPM_REGISTRY } from '../const'
import json from '../shared/json'

const { cyan, yellow, red } = chalk

import Install from './install'

const LOG_MODULE = '[create]'

const yoemanEnv = createEnv()

type PromptAnswer = {
  tplName: string
  newPkgName: string
}

type Generator = {
  name: string
  value: string
}

/**
 * Generate a conversation
 */
const createPrompts = (generators: Generator[]) => {
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
      message: 'Please enter git url or package name:',
      type: 'input',
      name: 'newPkgName',
      when: (answers: PromptAnswer) => answers.tplName === '__ADD_NEW',
    },
  ]
}

export default class Create extends Base {
  dir: DirectoryInfo = {
    home: '',
    tpl: '',
    cwd: '',
  }

  constructor() {
    super()
  }

  async start(dir: DirectoryInfo) {
    this.dir = dir
    const generators = this.getInstalledGenerators(this.dir.tpl)

    if (!generators.length) {
      console.log(yellow(`${LOG_MODULE} There are no templates installed.`))
      process.exit(1)
    }

    const { tplName, newPkgName } = await inquirer.prompt<PromptAnswer>(createPrompts(generators))
    if (!tplName) {
      process.exit(1)
    }

    if (tplName === '__ADD_NEW') {
      const installIns = new Install()
      installIns.start(this.dir, { pkgName: newPkgName })
      return
    }

    // install dependencies when the template is not installed
    this.prepareChoosedTplDep(this.dir.tpl, tplName)

    try {
      this.yoemanRegister(this.dir.tpl, tplName)
    } catch(err) {
      console.log(red(`${LOG_MODULE} This template has some error \n\n ${err}`))
    }
  }
  /**
   * prepare choosed template dependencies
   * @param generatorsPath
   * @param tplName
   */
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
      console.log(cyan(`\n${LOG_MODULE} Congratulations, the project has been initialized successfully.`))
      await this.logCV()
    }
  }
  /**
   * get installed templates
   * @param generatorsPath
   * @returns
   */
  getInstalledGenerators(generatorsPath: string) {
    const generators: string[] = fs.readdirSync(generatorsPath).filter((item) => fs.statSync(path.join(generatorsPath, `./${item}`)).isDirectory())
    return generators.reduce((acc: Array<{ name: string; value: string }>, cur) => {
      const jData = json.read(path.join(generatorsPath, `./${cur}/package.json`))
      acc.push({
        name: jData.description,
        value: cur,
      })
      return acc
    }, [])
  }
}
