import path from 'node:path'
import { home } from 'osenv'

/**
 * user home dir
 */
export const HOMEDIR = home()

/**
 * scripts folder name
 */
export const COMMANDS_FOLDER = 'scripts'

/**
 * cli name
 */
export const CLI_NAME = 'cv'

/**
 * default npm registry
 */
export const NPM_REGISTRY = 'https://registry.npmmirror.com/'

/**
 * cli config file name, eg: .cv.js
 */
export const CONFIG_FILE_NAME = `.${CLI_NAME}.js`

/**
 * init flag file
 */
export const INIT_FLAG_FILE = `.${CLI_NAME}/.initialized`

/**
 * templates dir name of user client
 */
export const CACHE_TEMPLATE_FOLDER_NAME = `.${CLI_NAME}/generators`

/**
 * package name of cached template
 */
export const CACHE_TEMPLATE_PACKAGE_NAME = `@${CLI_NAME}/cli-workspace`

/**
 * prefix of template package
 */
export const TEMPLATE_PREFIX = `@otdrfu/generator`

/**
 * git url of template to install
 */
export const TEAMPLATE_EXAMPLE_URL = 'https://git.xxx.com/xxx.git'

/**
 * default templates
 */
export const DEFAULT_TEMPLATES: Template[] = []

/**
 * template dir of user client
 */
export const TEMPLATE_DIR = path.resolve(HOMEDIR, CACHE_TEMPLATE_FOLDER_NAME)
