import fs from 'node:fs'
import path from 'node:path'
import { execSync, exec } from 'node:child_process'
import chalk from 'chalk'
import inquirer from 'inquirer'

import { NPM_REGISTRY, TEMPLATE_PREFIX } from '../const'
import json from '../shared/json'
import { isUrl, getGitRepoName, isValidPackageName } from '../shared/index'
import Base from './base'
const { green, yellow, cyan, red } = chalk

const LOG_MODULE = '[install]'
export default class Install extends Base {
  pkgName: string = ''
  dir: DirectoryInfo = {
    home: '',
    tpl: '',
    cwd: '',
  }

  constructor() {
    super()
  }
  async start(dir: DirectoryInfo, args: Record<string, string>) {
    this.dir = dir
    if (!args.pkgName) {
      process.exit(1)
    }

    await this.installGenerator(args.pkgName)
  }
  /**
   * install generator
   * @param name template name
   */
  async installGenerator(target: string) {
    if (isUrl(target)) {
      const templateName = getGitRepoName(target)
      const exist = fs.existsSync(path.join(this.dir.tpl, `generator-${templateName}`))
      if (exist) {
        console.log(yellow(`${LOG_MODULE} ${templateName} already exists.`))
        // ask user to delete and install again

        const { reinstall } = await inquirer.prompt<{ reinstall: boolean }>({
          type: 'confirm',
          name: 'reinstall',
          message: 'Do you want to reinstall?',
          default: false,
        })

        if (!reinstall) {
          process.exit(1)
        }

        fs.rmSync(path.join(this.dir.tpl, `generator-${templateName}`), { recursive: true, force: true })
      }
      await this.installByGit(target, templateName)
      this.checkIsYoemanGenerator(templateName)
    } else {
      if (!isValidPackageName(target)) {
        console.log(red(`${LOG_MODULE} ${target} is not a valid package name`))
        process.exit(1)
      }

      this.installByNpm(target)
    }
  }
  /**
   * install generator by git clone
   * @param url git url
   */
  async installByGit(url: string, templateName: string) {
    return new Promise((resolve, reject) => {
      console.log(green(`${LOG_MODULE} Start to clone ${templateName}`))
      if (!url) {
        console.log(red(`${LOG_MODULE} Url is required`))
        process.exit(1)
      }
      const [repository, branch] = url.split('#')
      exec(
        `git clone ${repository} ${branch ? `--branch ${branch}` : ''}`,
        {
          cwd: this.dir.tpl,
        },
        (error, stdout, stderr) => {
          if (error) {
            return reject(`Error cloning repository: ${stderr}`);
          }
          resolve(stdout);
        },
      )
    })
  }
  /**
   * install generator by npm
   * @param name template name
   */
  installByNpm(name: string) {
    const pkgName = name.startsWith(TEMPLATE_PREFIX) ? name : `${TEMPLATE_PREFIX}-${name}`
    execSync(`npm i ${pkgName}@latest -S --registry=${NPM_REGISTRY}`, { cwd: this.dir.tpl })
    console.log(green(`${LOG_MODULE} ${pkgName}installed successfully.`))
  }
  /**
   * check is yoeman generator
   * @param templateName
   */
  async checkIsYoemanGenerator(templateName: string) {
    // download project path
    const projectPath = path.join(this.dir.tpl, templateName)
    // get name from package.json
    const pkgJson = json.read(path.join(projectPath, 'package.json'))
    const isGenerator = pkgJson.name.startsWith('@iface/generator-uniapp')
    if (isGenerator) {
      console.log(cyan(`${LOG_MODULE} Install successfully.`))
      await this.logCV()
      return
    }

    const exist = fs.existsSync(projectPath)
    if (exist) {
      // copy generator-template
      const generatorTemplatePath = path.join(__dirname, '../../generators/generator-template')

      // rename
      const newGeneratorPath = path.join(this.dir.tpl, `generator-${templateName}`)
      fs.cpSync(generatorTemplatePath, newGeneratorPath, { recursive: true })

      // copy download folder to template folder
      fs.cpSync(projectPath, path.join(newGeneratorPath, 'template'), { recursive: true })

      // remove download folder
      fs.rmSync(projectPath, { recursive: true, force: true })

      // update generator package.json
      json.update(path.join(newGeneratorPath, 'package.json'), (json) => {
        json.name = `${TEMPLATE_PREFIX}-${templateName}`
        json.description = templateName
        return json
      })

      console.log(green(`${LOG_MODULE} Start to install dependencies`))

      // install yeoman-generator dependencies
      execSync(`npm i`, { cwd: newGeneratorPath, stdio: 'inherit' })

      // update template package.json
      json.update(path.join(newGeneratorPath, 'template/package.json'), (json) => {
        json.name = '<%= appName %>'
        json.author = '<%= author %>'
        json.description = '<%= description %>'
        return json
      })

      console.log(cyan(`\n${LOG_MODULE} Congratulations, the template has been installed successfully.`))

      await this.logCV()

      return
    }
    console.log(red(`${LOG_MODULE} ${projectPath} don't exist.`))
  }
}
