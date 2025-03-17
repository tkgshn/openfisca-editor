export interface Institution {
  name: string
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
  source: "sample" | "user" // 追加: 制度のソースを示す
  id: string // 追加: 一意のID
  visibility?: string // 追加: 公開範囲（private, restricted, public）
  publishedAt?: string // 追加: 公開日時
  versions: Version[]
  currentVersion: string // ID of the current version
  lastTestResults?: TestResults
}

export interface TestCase {
  parent: number[]
  grandparent: number[]
  child: number[]
  amount: number
}

export interface Parameter {
  name: string
  description: string
  reference: string
  unit: string
  values: ParameterValue[]
}

export interface ParameterValue {
  date: string
  value: number
  label: string
  description: string
}

export interface Version {
  id: string
  timestamp: string
  message: string
  changes: {
    before: Partial<Institution>
    after: Partial<Institution>
  }
  commitHash?: string  // GitコミットのハッシュID
  testResults?: TestResults
}

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
