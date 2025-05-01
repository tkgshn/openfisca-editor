import { render, screen, fireEvent } from '@testing-library/react'
import { TestCasePanel } from '@/components/test/test-case-panel'
import { ja } from '@/lib/i18n/locales/ja'

jest.mock('@/lib/i18n', () => {
  const originalModule = jest.requireActual('@/lib/i18n');
  return {
    ...originalModule,
    useI18n: () => ({
      locale: 'ja',
      t: ja,
      changeLocale: jest.fn(),
    }),
  };
});

const mockInstitution = {
  id: 'test-id',
  source: 'user' as const,
  name: '児童手当',
  formulaCode: '',
  testCases: [
    {
      parent: [35],
      grandparent: [],
      child: [2],
      amount: 15000,
    },
  ],
  versions: [],
  currentVersion: '',
}

const mockOnUpdate = jest.fn()

describe('TestCasePanel', () => {
  it('renders test cases correctly', () => {
    render(
      <TestCasePanel 
        institution={mockInstitution} 
        onUpdate={mockOnUpdate} 
      />
    )
    
    expect(screen.getByText(ja.testCase.title)).toBeInTheDocument()
    
    expect(screen.getByText(ja.testCase.add)).toBeInTheDocument()
    
    expect(screen.getByText(`15,000 ${ja.testCase.yen}`)).toBeInTheDocument()
  })
  
  it('opens modal when add button is clicked', () => {
    render(
      <TestCasePanel 
        institution={mockInstitution} 
        onUpdate={mockOnUpdate} 
      />
    )
    
    fireEvent.click(screen.getByText(ja.testCase.add))
    
  })
})
