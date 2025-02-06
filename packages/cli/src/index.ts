import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import chalk from 'chalk'
import semver from 'semver'
import minimist from 'minimist'
import { mkdirp } from 'mkdirp'
import Install from './scripts/install'

import {
  DEFAULT_TEMPLATES,
  CLI_NAME,
  COMMANDS_FOLDER,
  HOMEDIR,
  TEMPLATE_DIR,
  NPM_REGISTRY,
  CACHE_TEMPLATE_PACKAGE_NAME
} from 'src/const'
import pkg from '../package.json'

const { cyan, yellow, green } = chalk

const helpMessage = `\
Usage: cv [COMMAND] [OPTION]

Create a new cv project or template.

Commands:
  create       create a project by choosed template

Available commands:

${cyan('create      alias c, create a project')}
${cyan('install     alais i, install project template to local')}
${cyan('yo          create a project template')}
`

const noCmdMessage = (supportedCmds: string) => `
Supported Commands:

${cyan(supportedCmds)}
`

const upgradeMesssage = (ltsVersion: string) => `
${yellow(`${CLI_NAME} is old(v${pkg.version}), you can execute "npm i -g ${pkg.name}@latest" to upgrade(${ltsVersion}`)}
`

class CLI {
  argv: Record<string, string[]> = {}
  dir: DirectoryInfo
  constructor() {
    this.argv = minimist(process.argv)
    this.dir = {
      home: HOMEDIR,
      tpl: TEMPLATE_DIR,
      cwd: process.cwd(),
    }

    this.start()
  }
  async start() {
    await this.initWhenFirstRun()
    // this.isOutdatedCli()
    this.execCmd()
  }
  async initWhenFirstRun() {
    await this.prepareTemplateDir(this.dir)
    await this.installDefaultTpls()
  }
  /**
   * is help command
   */
  isHelpCommand() {
    return this.argv['help'] || this.argv['h']
  }
  /**
   * is check version command
   */
  isCheckVersionCommand() {
    return this.argv['version'] || this.argv['v']
  }
  /**
   * execute command
   */
  async execCmd() {
    if (this.isHelpCommand()) {
      console.log(yellow(helpMessage))
      process.exit(0)
    }
    if (this.isCheckVersionCommand()) {
      console.log(green(`v${pkg.version}`))
      process.exit(0)
    }
    const command = this.argv['_'][2]
    const supportedCmds = fs.readdirSync(path.resolve(__dirname, COMMANDS_FOLDER)).map((item) => item.split('.')[0])
    if (!supportedCmds.includes(command)) {
      console.log(noCmdMessage(supportedCmds.join('\n')))
      process.exit(1)
    }

    // resolve command file
    const CmdClass = require(path.resolve(__dirname, COMMANDS_FOLDER, command))

    const commander = new CmdClass.default({ dir: this.dir, args: this.argv })
    commander.start()
  }
  /**
   * check cli for outdated
   */
  isOutdatedCli() {
    const ltsVersion = execSync(`npm view ${pkg.name} version --registry=${NPM_REGISTRY}`) + ''
    if (semver.lt(pkg.version, ltsVersion)) {
      console.log(upgradeMesssage(ltsVersion))
      return true
    }
    return false
  }
  /**
   * prepare template dir
   * @param dir directory info
   */
  async prepareTemplateDir(dir: DirectoryInfo) {
    // template package
    const pkg = path.resolve(dir.tpl, 'package.json')
    if (fs.existsSync(pkg)) return

    await mkdirp(dir.tpl)

    fs.writeFileSync(
      pkg,
      JSON.stringify(
        {
          name: CACHE_TEMPLATE_PACKAGE_NAME,
          description: '_',
          repository: '_',
          license: 'MIT',
        },
        null,
        2
      )
    )
  }
  /**
   * Install the default template
   */
  async installDefaultTpls() {
    const installIns = new Install({ dir: this.dir, pkgName: '' })
    for (const tpl of DEFAULT_TEMPLATES) {
      // if the template is installed, skip
      if (fs.existsSync(path.resolve(this.dir.tpl, `generator-${tpl.name}`))) continue
      await installIns.installGenerator(tpl.url)
    }
  }
}

export default new CLI()
