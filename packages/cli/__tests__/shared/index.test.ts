import fs from 'fs'
import {
  isUrl,
  getGitRepoName,
  toValidPackageName,
  isValidPackageName,
} from 'src/shared/index'
import json from 'src/shared/json'

describe('shared/index', () => {
  describe('isUrl', () => {
    it('should validate URLs correctly', () => {
      expect(isUrl('https://github.com/user/repo.git')).toBe(true)
      expect(isUrl('http://github.com/user/repo.git')).toBe(true)
      expect(isUrl('ssh://git@github.com/user/repo.git')).toBe(true)
      expect(isUrl('not-a-url')).toBe(false)
    })
  })

  describe('getGitRepoName', () => {
    it('should extract repository name from git URL', () => {
      expect(getGitRepoName('https://github.com/user/repo.git')).toBe('repo')
      expect(getGitRepoName('https://github.com/user/my-project.git')).toBe('my-project')
    })
  })

  describe('package name validation', () => {
    it('should validate package names', () => {
      expect(isValidPackageName('valid-name')).toBe(true)
      expect(isValidPackageName('@scope/valid-name')).toBe(true)
      expect(isValidPackageName('Invalid Name')).toBe(false)
    })

    it('should convert to valid package names', () => {
      expect(toValidPackageName('My Project')).toBe('my-project')
      expect(toValidPackageName('_invalid.name')).toBe('invalid-name')
    })
  })

  describe('readJson', () => {
    it('should read and parse JSON file correctly', () => {
      const mockJson = { test: 'value' }
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockJson))

      expect(json.read('mock/path.json')).toEqual(mockJson)
    })
  })
})
