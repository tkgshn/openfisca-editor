import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // APIキーを環境変数から取得（サーバーサイドのAPIキーを優先）
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    // 注意: APIキー設定に問題がある場合は、generateText関数の外でAPIキーを設定する必要があるかもしれません
    // 例: process.env.OPENAI_API_KEY = apiKey;
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return NextResponse.json({ text })
  } catch (error) {
    console.error("OpenAI API error:", error)
    return NextResponse.json({ error: "Failed to generate text" }, { status: 500 })
  }
}
