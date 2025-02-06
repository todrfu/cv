const fs = require('fs')
const path = require('path')

function formatVal(val) {
  return val
    .replace(/[\u0000-\u0019]/g, '')
    .replace(/^(\s|\xA0)+|(\s|\xA0)+$/g, '')
}

exports.questions = [
  {
    type: 'input',
    message: 'Set project name',
    name: 'appName',
    default: path.basename(process.cwd()),
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
    default: '',
  },
  {
    type: 'confirm',
    message: 'Automatically install dependencies after initialization?',
    name: 'installImmediately',
    default: false,
  },
]
