/**
 * Type definitions for the OpenFisca Editor application
 * @module types/types
 */

/**
 * Institution representation
 */
export interface Institution {
  id: string
  name: string
  description?: string
  url?: string
  summary?: string
  usage?: string
  conditions?: string
  department?: string
  postingUrl?: string
  applicationUrl?: string
  formulaCode: string
  testCases: TestCase[]
  testYamlRaw?: string
  mermaidCode?: string
  parameters?: Parameter[]
  source: "sample" | "user" 
  visibility?: string // 公開範囲（private, restricted, public）
  publishedAt?: string // 公開日時
  versions: Version[]
  currentVersion: string // ID of the current version
  lastTestResults?: TestResults
  tags?: Tag[] // リリースタグ情報
  stats?: {
    variables: number
    parameters: number
    tests: number
  }
}

/**
 * Test case for institution
 */
export interface TestCase {
  parent: number[]
  grandparent: number[]
  child: number[]
  amount: number
}

/**
 * Parameter for policy configuration
 */
export interface Parameter {
  id?: string
  name: string
  path?: string
  description: string
  reference?: string
  unit: string
  values: ParameterValue[]
  metadata?: Record<string, any>
}

/**
 * Parameter value with date information
 */
export interface ParameterValue {
  date: string
  value: number | boolean | string
  label?: string
  description?: string
}

/**
 * Version information for institution
 */
export interface Version {
  id: string
  timestamp: string
  message: string
  changes: {
    before: Partial<Institution>
    after: Partial<Institution>
  }
  testResults?: TestResults
  commitHash?: string // Gitコミットハッシュ
}

/**
 * Tag for named version
 */
export interface Tag {
  name: string
  message: string
  date: string
  commitHash?: string
}

/**
 * Test results
 */
export interface TestResults {
  success: boolean
  timestamp: string
  duration: number
  details: {
    passed: number
    failed: number
    total: number
    errors?: string[]
  }
}

/**
 * Individual test result
 */
export interface TestResult {
  name: string
  passed: boolean
  output: Record<string, any>
  expected: Record<string, any>
  error: string | null
}

/**
 * 3D visualization data point
 */
export interface SimulationData {
  x: number
  y: number
  z: number
  color: number
  time?: number
  value?: number
}

/**
 * Variable representation in OpenFisca
 */
export interface Variable {
  id: string
  name: string
  valueType: "boolean" | "integer" | "float" | "date" | "string" | "enum"
  entity: string
  definitionPeriod: "ETERNITY" | "YEAR" | "MONTH" | "DAY"
  label: string
  description?: string
  formula?: string
  references?: string[]
}

/**
 * Test file representation in filesystem
 */
export interface TestFile {
  id: string
  name: string
  period: string
  input: Record<string, any>
  output: Record<string, any>
}

/**
 * Simulation results structure
 */
export interface SimulationResults {
  stats: {
    totalHouseholds: number
    eligibleCount: number
    eligibilityRate: number
    totalSupport: number
    avgSupport: number
  }
  plotData: {
    data: any[]
    layout: any
  }
  // 互換性のために追加
  totalHouseholds?: number
  targetHouseholds?: number
  totalAmount?: number
  averageAmount?: number
  visualizationData?: SimulationData[]
}

