import { getInstalledStatus, getInstalledGenerators } from 'src/shared/package'
import { TEMPLATE_PREFIX } from 'src/const'

jest.mock('child_process', () => ({
  execSync: jest.fn(() => '1.0.0\n')
}))

jest.mock('import-from', () => ({
  silent: jest.fn(() => ({ version: '1.0.0' }))
}))

describe('shared/package', () => {
  const mockTargetDir = '/mock/path'

  describe('getInstalledStatus', () => {
    it('should return correct installation status', () => {
      // Test for not installed
      expect(getInstalledStatus('non-existent-pkg', mockTargetDir)).toBe(0)
    })
  })

  describe('getInstalledGenerators', () => {
    it('should filter and return only generator packages', () => {
      const result = getInstalledGenerators(mockTargetDir)
      expect(Object.keys(result).every(key => key.startsWith(TEMPLATE_PREFIX))).toBe(true)
    })
  })
})
