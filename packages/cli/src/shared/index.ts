import fs from 'node:fs'
import path from 'node:path'
import dowload from 'download-git-repo'
import { execSync } from 'node:child_process'

export function copy(src: string, dest: string) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

export function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(projectName)
}

export function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z\d\-~]+/g, '-')
}

export function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}

export function isEmpty(path: string) {
  const files = fs.readdirSync(path)
  return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

export function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === '.git') {
      continue
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true })
  }
}

/**
 * validate url
 * @param url
 */
export function isUrl(url: string) {
  return /^(https?|ssh):\/\/.+$/.test(url)
}

/**
 * extract repository name from zip url
 * @param url
 */
export function getTemplateNameByUrl(url: string) {
  return url.match(/\/([^/]+)\.zip$/)?.[1] || ''
}

/**
 * extract repository name from git url
 * @param url
 */
export function getGitRepoName(url: string) {
  return url.match(/\/([^/]+)\.git$/)?.[1] || ''
}

/**
 * read json file
 * @param filePath
 */
export function readJson(filePath: string) {
  // try {
  // } catch (err) {
  //   console.log(chalk.red(`can't parse file "${filePath}": ${err}`))
  // }
  const data = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(data)
}

/**
 * update json file data
 * @param filePath
 * @param updateJSON
 */
export function updateJson(filePath: string, updateJSON: (json: Record<string, any>) => Record<string, any>) {
  const jsonData = readJson(filePath)
  if (!jsonData) return
  // try {
  // } catch (writeErr) {
  //   console.log(chalk.red(`can't write file "${filePath}": ${writeErr}`))
  // }
  fs.writeFileSync(filePath, JSON.stringify(updateJSON(jsonData), null, 2), 'utf8')
}

/**
 * download git zip
 * @param gitUrl zip url，eg: https://xxx/-/archive/master/xxxx.zip
 * @param destPath project dest path
 */
export function downloadGitProject(gitUrl: string, destPath: string) {
  return new Promise((resolve, reject) => {
    dowload(
      `direct:${gitUrl}`,
      destPath,
      {
        clone: false,
        headers: {},
      },
      (err) => {
        if (err) {
          return reject(err)
        }
        resolve({ status: 'success' })
      }
    )
  })
}

/**
 * 查询与关键字pkgName相关的npm包
 * @param pkgName string
 * @returns npm包信息数组
 */
export function getRemoteTemplates(pkgName: string): Array<{ name: string; description: string }> {
  let packages = []
  try {
    const commandOutput = execSync(`npm search ${pkgName} --json`).toString()
    packages = JSON.parse(commandOutput)
  } catch (err) {
    console.log('查询模板列表失败')
  }
  return packages
}
