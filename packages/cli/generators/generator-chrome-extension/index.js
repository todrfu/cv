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
    
    // 首先复制所有不需要模板化的文件
    this.fs.copy(this.templatePath(templateDir, './.gitignore'), this.destinationPath(projectDir, '.gitignore'))

    this.fs.copyTpl(
      this.templatePath(templateDir, '.github/workflows/build.yml'),
      this.destinationPath(projectDir, '.github/workflows/build.yml'),
      this.answers
    )

    this.fs.copyTpl(
      this.templatePath(templateDir, './build.js'), 
      this.destinationPath(projectDir, 'build.js'), 
      this.answers
    )

    this.fs.copyTpl(
      this.templatePath(templateDir, './package.json'), 
      this.destinationPath(projectDir, 'package.json'), 
      this.answers
    )
    
    this.fs.copyTpl(
      this.templatePath(templateDir, './README.md'),
      this.destinationPath(projectDir, './README.md'),
      this.answers
    )

    // 复制src目录下的其他文件
    fs.readdirSync(this.templatePath(path.join(templateDir, 'src')))
      .filter((name) => !['popup.html', 'manifest.json'].includes(name))
      .forEach((item) => {
        this.fs.copy(
          this.templatePath(templateDir, `src/${item}`),
          this.destinationPath(projectDir, `src/${item}`)
        )
      })
    
    this.fs.copyTpl(
      this.templatePath(templateDir, './src/popup.html'),
      this.destinationPath(projectDir, './src/popup.html'),
      this.answers
    )

    this.fs.copyTpl(
      this.templatePath(templateDir, './src/manifest.json'),
      this.destinationPath(projectDir, './src/manifest.json'),
      this.answers
    )
    
  }

  install() {
    const { installImmediately } =  this.answers
    if (!installImmediately) return;
    const projectDir = path.join(process.cwd(), this.answers.appName)
    this.spawnCommandSync('npm', ['install'], { cwd: projectDir })
  }

  end() {}
}
