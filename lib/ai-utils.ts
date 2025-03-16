import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateMermaidFromConditions(conditions: string): Promise<string> {
  if (!conditions || conditions.trim() === "") {
    return `flowchart TD
    A["開始"] --> B["条件が指定されていません"]
    B --> C["終了"]`
  }

  const prompt = `
あなたは社会保障制度の条件を分析し、Mermaidフローチャートに変換する専門家です。
以下の利用条件を分析して、条件判定のフローチャートをMermaid記法で作成してください。

利用条件:
${conditions}

以下の点に注意してください:
- フローチャートは「開始」から始まり、「終了」で終わるようにしてください
- 条件分岐は明確に表現してください（例: 年齢 >= 65）
- 日本語を使用してください
- 複数の条件がある場合は、論理的な順序で表現してください
- 条件を満たす場合と満たさない場合の両方のパスを示してください
- 支給額や給付内容も含めてください
- Mermaid記法のみを出力してください、説明は不要です

出力形式:
\`\`\`mermaid
flowchart TD
  A["開始"] --> B["条件1の確認"]
  B -->|"条件を満たす"| C["次の条件へ"]
  B -->|"条件を満たさない"| D["対象外"]
  ...
\`\`\`
`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    // Extract the Mermaid code from the response
    const mermaidMatch = text.match(/```mermaid\s*([\s\S]*?)\s*```/)
    if (mermaidMatch && mermaidMatch[1]) {
      return mermaidMatch[1].trim()
    }

    // If no Mermaid code was found, return a simple diagram
    return `flowchart TD
    A["開始"] --> B["${conditions}"]
    B -->|"条件を満たす"| C["給付対象"]
    B -->|"条件を満たさない"| D["対象外"]
    C --> E["終了"]
    D --> E`
  } catch (error) {
    console.error("Error generating Mermaid diagram:", error)
    return `flowchart TD
    A["開始"] --> B["エラーが発生しました"]
    B --> C["終了"]`
  }
}

