import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
})

async function askGPT() {
  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: 'user', content: 'What is the capital of France?' }],
    model: 'gpt-4o',
  })

  return chatCompletion.choices[0].message.content
}

// askGPT().then((res) => {
//   console.log(res)
// })
