import { render, screen, fireEvent } from '@testing-library/react'
import { TestCasePanel } from '@/components/test/test-case-panel'

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
    
    expect(screen.getByText('テストケース')).toBeInTheDocument()
    
    expect(screen.getByText('テストケース追加')).toBeInTheDocument()
    
    expect(screen.getByText('15,000円')).toBeInTheDocument()
  })
  
  it('opens modal when add button is clicked', () => {
    render(
      <TestCasePanel 
        institution={mockInstitution} 
        onUpdate={mockOnUpdate} 
      />
    )
    
    fireEvent.click(screen.getByText('テストケース追加'))
    
  })
})
