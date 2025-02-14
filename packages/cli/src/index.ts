import fs from 'node:fs'
import path from 'node:path'
import minimist from 'minimist'
import chalk from 'chalk'
import { mkdirp } from 'mkdirp'
import { program } from 'commander'
import Install from './scripts/install'

import {
  DEFAULT_TEMPLATES,
  HOMEDIR,
  CACHE_TEMPLATE_PACKAGE_NAME,
  CACHE_TEMPLATE_FOLDER_NAME,
  INIT_FLAG_FILE,
} from 'src/const'

const { green } = chalk
class CLI {
  argv: Record<string, string[]> = {}
  dir: DirectoryInfo
  static helpMessage: () => string;

  constructor() {
    this.argv = minimist(process.argv)
    this.dir = {
      home: HOMEDIR,
      tpl: path.resolve(HOMEDIR, CACHE_TEMPLATE_FOLDER_NAME),
      cwd: process.cwd(),
    }

    this.start()
  }
  async start() {
    await this.initWhenFirstRun()
    this.registreCommands()
  }
  /**
   * initialize when first run
   */
  async initWhenFirstRun() {
    // check is initialized
    const initFlagFile = path.resolve(this.dir.home, INIT_FLAG_FILE)
    if (!fs.existsSync(initFlagFile)) {
      await this.prepareTemplateDir(this.dir)
      await this.copyGenerators()
      fs.writeFileSync(initFlagFile, new Date().toISOString())
      await this.installDefaultTpls()
    }
  }
  /**
   * register commands
   */
  registreCommands() {
    const commandsDir = path.resolve(__dirname, 'commands')
    const commands = fs.readdirSync(commandsDir)
    for (const command of commands) {
      const commandFile = require(path.resolve(commandsDir, command))
      const cmdIns = new commandFile.default(this.dir)
      cmdIns.register()
    }
    program.parse(process.argv)
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
    const installIns = new Install()
    if (DEFAULT_TEMPLATES.length > 0) {
      console.log(green('[cv init] first use, install the default template...'))
    }
    for (const tpl of DEFAULT_TEMPLATES) {
      // if the template is installed, skip
        if (fs.existsSync(path.resolve(this.dir.tpl, `generator-${tpl.name}`))) continue
        await installIns.start(this.dir, { pkgName: tpl.url })
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
