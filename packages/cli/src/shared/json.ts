import fs from 'node:fs'
/**
 * read json file
 * @param filePath
 */
function readJson(filePath: string) {
  const data = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(data)
}

/**
 * update json file data
 * @param filePath
 * @param updateJSON
 */
function updateJson(filePath: string, updateJSON: (json: Record<string, any>) => Record<string, any>) {
  const jsonData = readJson(filePath)
  if (!jsonData) return
  fs.writeFileSync(filePath, JSON.stringify(updateJSON(jsonData), null, 2), 'utf8')
}

export default {
  read: readJson,
  update: updateJson,
}
