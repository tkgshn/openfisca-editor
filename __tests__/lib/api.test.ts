import { fetchInstitutions, createInstitution, updateInstitution } from '@/lib/api'

const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => {
      return store[key] || null
    }),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('Institution API functions', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    jest.clearAllMocks()
  })

  test('fetchInstitutions returns both sample and user institutions', async () => {
    mockLocalStorage.setItem('openfisca-user-institutions', JSON.stringify([
      { id: 'user-1', name: 'Test Institution', source: 'user', formulaCode: '', testCases: [], versions: [], currentVersion: '' }
    ]))

    const institutions = await fetchInstitutions()
    
    expect(institutions.length).toBeGreaterThan(0)
    expect(institutions.some(inst => inst.source === 'user')).toBe(true)
  })

  test('createInstitution adds a new institution and returns it', async () => {
    const newInstitution = await createInstitution('New Test Institution')
    
    expect(newInstitution.name).toBe('New Test Institution')
    expect(newInstitution.id).toBeDefined()
    expect(newInstitution.source).toBe('user')
    
    expect(mockLocalStorage.setItem).toHaveBeenCalled()
  })

  test('updateInstitution modifies an existing institution', async () => {
    const institution = await createInstitution('Test Institution')
    
    const updatedInstitution = {
      ...institution,
      name: 'Updated Institution',
    }
    
    await updateInstitution(updatedInstitution, 'Update name')
    
    const storedData = JSON.parse(mockLocalStorage.getItem('openfisca-user-institutions') || '[]')
    const storedInstitution = storedData.find((i: any) => i.id === institution.id)
    
    expect(storedInstitution).toBeDefined()
    expect(storedInstitution.name).toBe('Updated Institution')
  })
})
