import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import chalk from 'chalk'
import semver from 'semver'
import minimist from 'minimist'
import { mkdirp } from 'mkdirp'
import Install from './scripts/install'

import pkg from '../package.json'
import {
  DEFAULT_TEMPLATES,
  CLI_NAME,
  COMMANDS_FOLDER,
  HOMEDIR,
  TEMPLATE_DIR,
  NPM_REGISTRY,
  CACHE_TEMPLATE_PACKAGE_NAME,
  INIT_FLAG_FILE,
} from 'src/const'

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
    // check is initialized
    const initFlagFile = path.resolve(this.dir.home, INIT_FLAG_FILE)
    if (!fs.existsSync(initFlagFile)) {
      await this.prepareTemplateDir(this.dir)
      await this.copyGenerators()
      fs.writeFileSync(initFlagFile, new Date().toISOString())
    }

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
    const pkg = path.resolve(dir.tpl, 'package.json')

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
  /**
   * copy generators dir to user config dir
   */
  async copyGenerators() {
    const cacheTemplateDir = this.dir.tpl
    if (!fs.existsSync(cacheTemplateDir)) return

    const generatorsSourceDir = path.resolve(__dirname, '../generators')

    // filter folder
    const items = fs.readdirSync(generatorsSourceDir).filter((item) => fs.statSync(path.join(__dirname, '../generators', item)).isDirectory())
    for (const item of items) {
      if (item === 'generator-template') continue

      const srcPath = path.join(generatorsSourceDir, item)
      const destPath = path.join(cacheTemplateDir, item)

      if (!fs.statSync(srcPath).isDirectory()) continue

      if (fs.existsSync(destPath)) continue

      await this.copyDir(srcPath, destPath)
    }
  }
  /**
   * recursive copy dir
   */
  async copyDir(src: string, dest: string) {
    await mkdirp(dest)

    const entries = fs.readdirSync(src, { withFileTypes: true })

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name)
      const destPath = path.join(dest, entry.name)

      if (entry.isDirectory()) {
        await this.copyDir(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
      }
    }
  }
}

export default new CLI()
