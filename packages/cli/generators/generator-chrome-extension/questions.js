const fs = require('fs')
const path = require('path')
const pkg = require('./package.json')

function formatVal(val) {
  return val
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z\d\-~]+/g, '-')
}

exports.questions = [
  {
    type: 'input',
    message: 'Set project name',
    name: 'appName',
    default: pkg.name,
    filter: (val) => formatVal(val),
  },
  {
    type: 'confirm',
    message: 'A directory with the same name already exists locally. Do you want to delete this directory?',
    name: 'clearSameProject',
    default: false,
    when: (answers) => fs.existsSync(path.join(process.cwd(), answers.appName)),
  },
  {
    type: 'input',
    message: 'Set project owner',
    name: 'author',
    default: 'todrfu',
  },
  {
    type: 'input',
    message: 'Set project description',
    name: 'description',
    default: pkg.name,
  },
  {
    type: 'confirm',
    message: 'Automatically install dependencies after initialization?',
    name: 'installImmediately',
    default: true,
  },
]
