import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import chalk from 'chalk'

import { NPM_REGISTRY, TEMPLATE_PREFIX, TEAMPLATE_EXAMPLE_URL, CLI_NAME } from 'src/const'
import ScriptBase from 'src/baseScript'
import { isUrl, getGitRepoName, readJson, updateJson } from 'src/shared/index'

const { green, yellow, cyan, red } = chalk

const LOG_MODULE = '[install template]'

const installTipMessage = `
Please specify the git url or package name of npm to install.

eg:

${cyan(`${CLI_NAME} install ${TEAMPLATE_EXAMPLE_URL}\n${CLI_NAME} install ${TEMPLATE_PREFIX}-xxx`)}
`

export default class Install implements ScriptBase {
  pkgName: string
  dir: DirectoryInfo

  constructor({ pkgName, dir }: { pkgName: string; dir: DirectoryInfo }) {
    this.dir = dir
    this.pkgName = pkgName || process.argv[3]
  }
  start() {
    if (!this.pkgName) {
      console.log(yellow(installTipMessage))
      process.exit(1)
    }

    // const status = getInstalledStatus(this.pkgName, this.dir.tpl)
    // if (status === 2) {
    //   console.log(green('The template has been installed'))
    //   return
    // }

    this.installGenerator(this.pkgName)
  }
  /**
   * install generator
   * @param name template name
   */
  async installGenerator(target: string) {
    if (isUrl(target)) {
      const templateName = getGitRepoName(target)
      console.log(green(`${LOG_MODULE} start install ${templateName}`))
      const exist = fs.existsSync(path.join(this.dir.tpl, `generator-${templateName}`))
      if (exist) {
        console.log(green(`${LOG_MODULE} ${templateName} has been installed.`))
        return
      }
      this.installByGit(target)
      this.checkIsYoemanGenerator(templateName)
    } else {
      this.installByNpm(target)
    }
  }
  /**
   * install generator by git clone
   * @param url git url
   */
  installByGit(url: string) {
    const branch = url.split('#').pop()
    execSync(`git clone ${url} ${branch ? `--branch ${branch}` : ''}`, {
      cwd: this.dir.tpl,
      stdio: 'inherit',
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
    const pkgJson = readJson(path.join(projectPath, 'package.json'))
    const isGenerator = pkgJson.name.startsWith(TEMPLATE_PREFIX)
    if (isGenerator) return

    const exist = fs.existsSync(projectPath)
    if (exist) {
      console.log(yellow(`${LOG_MODULE} ${templateName} is not a yoeman generator.`))

      // copy generator-template
      const generatorTemplatePath = path.join(__dirname, '../generator-template')

      // rename
      const newGeneratorPath = path.join(this.dir.tpl, `generator-${templateName}`)
      fs.cpSync(generatorTemplatePath, newGeneratorPath, { recursive: true })

      // copy download folder to template folder
      fs.cpSync(projectPath, path.join(newGeneratorPath, 'template'), { recursive: true })

      // remove download folder
      fs.rmSync(projectPath, { recursive: true, force: true })

      // update generator package.json
      updateJson(path.join(newGeneratorPath, 'package.json'), (json) => {
        json.name = `${TEMPLATE_PREFIX}-${templateName}`
        return json
      })

      // install yeoman-generator dependencies
      execSync(`npm i`, { cwd: newGeneratorPath, stdio: 'inherit' })

      // update template package.json
      updateJson(path.join(newGeneratorPath, 'template/package.json'), (json) => {
        json.name = '<%= appName %>'
        json.author = '<%= author %>'
        json.description = '<%= description %>'
        return json
      })

      console.log(green(`${LOG_MODULE} ${templateName} has been converted to yoeman generator.`))

      return
    }
    console.log(red(`${LOG_MODULE} ${templateName} download failed.`))
  }
}
