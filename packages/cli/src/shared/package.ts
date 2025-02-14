import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { silent as importFrom } from 'import-from'

import { TEMPLATE_PREFIX, NPM_REGISTRY } from 'src/const'

/**
 * Get the installed packages in the path
 * @param targetDir Directory Path
 */
export function getInstalledPkgs(targetDir: string): PlainObject {
  const pkgJsonFile = path.resolve(targetDir, 'package.json')
  if (!fs.existsSync(pkgJsonFile)) return {}
  const pkgJson = require(pkgJsonFile)
  return pkgJson.dependencies || {}
}

/**
 * Get the installation status of a package
 * @param pkgName package name
 * @param targetDir template folder
 * @returns 0: Not Installed 1: Installed Outdated 2: Installed Latest
 */
export function getInstalledStatus(pkgName: string, targetDir: string): number {
  const genObj = getInstalledPkgs(targetDir)
  if (!genObj[pkgName]) return 0
  const lts = execSync(`npm view ${pkgName} version --json --registry=${NPM_REGISTRY}`) + ''
  const current = (importFrom(targetDir, path.join(pkgName, 'package.json')) as PlainObject).version
  if (current === lts.trim()) return 2
  return 1
}

/**
 * Get the templates installed in the path
 * @param targetDir template folder
 */
export function getInstalledGenerators(targetDir: string): PlainObject {
  const dependencies = getInstalledPkgs(targetDir)
  Object.keys(dependencies).forEach((v) => {
    if (!v.startsWith(TEMPLATE_PREFIX)) {
      Reflect.deleteProperty(dependencies, v)
    }
  })
  return dependencies
}
