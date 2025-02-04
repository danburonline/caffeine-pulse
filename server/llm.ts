import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
})

export async function askGPT(message: string) {
  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: 'user', content: message }],
    model: 'gpt-4o',
  })

  return chatCompletion.choices[0].message.content
}
