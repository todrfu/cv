const fs = require('fs')
const path = require('path')
const YoGenerator = require('yeoman-generator')
const { rimrafSync } = require('rimraf')
const { questions } = require('./questions')

module.exports = class extends YoGenerator {
  prompting() {
    return this.prompt(questions).then((answers) => {
      this.answers = answers
    })
  }

  writing() {
    const { appName, clearSameProject } = this.answers
    const projectDir = path.join(process.cwd(), appName)

    if (clearSameProject) {
      rimrafSync(projectDir)
    }

    const templateDir = path.join(__dirname, 'template')
    this.fs.copyTpl(this.templatePath(templateDir, 'package.json'), this.destinationPath(projectDir, 'package.json'), this.answers)

    fs.readdirSync(this.templatePath(templateDir))
      .filter((name) => name !== 'package.json')
      .forEach((item) => {
        this.fs.copy(this.templatePath(templateDir, item), this.destinationPath(appName, item))
      })
  }

  install() {
    const { installImmediately } =  this.answers
    if (!installImmediately) return;
    const projectDir = path.join(process.cwd(), this.answers.appName)
    this.spawnCommandSync('npm', ['install'], { cwd: projectDir })
  }

  end() {}
}
