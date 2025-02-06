import Create from '../create'

jest.mock('inquirer')
jest.mock('yeoman-environment')

describe('Create Command', () => {
  const mockDir = {
    home: '/mock/home',
    tpl: '/mock/templates',
    cwd: '/mock/cwd'
  }

  let create: Create

  beforeEach(() => {
    create = new Create({ pkgName: '', dir: mockDir })
  })

  describe('generatePrompts', () => {
    it('should generate correct prompt structure', () => {
      const generators = [
        { name: 'Template 1', value: 'template-1' },
        { name: 'Template 2', value: 'template-2' }
      ]

      const prompts = create.generatePrompts(generators)
      expect(prompts).toHaveLength(2)
      expect(prompts[0].type).toBe('list')
      expect(prompts[0].choices).toHaveLength(generators.length + 1)
    })
  })
})
