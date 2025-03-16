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
  description: string
  stats?: {
    variables: number
    parameters: number
    tests: number
  }
}

/**
 * Test result representation
 */
export interface TestResult {
  name: string
  passed: boolean
  output: Record<string, any>
  expected: Record<string, any>
  error: string | null
}

/**
 * Simulation data point
 */
export interface SimulationData {
  time: number
  value: number
}

/**
 * Variable representation
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
 * Parameter representation
 */
export interface Parameter {
  id: string
  path: string
  description: string
  values: {
    date: string
    value: number | boolean | string
  }[]
  metadata?: Record<string, any>
}

/**
 * Test file representation
 */
export interface TestFile {
  id: string
  name: string
  period: string
  input: Record<string, any>
  output: Record<string, any>
}

