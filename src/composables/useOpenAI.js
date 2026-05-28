import { useAppStore } from '../stores/appStore'

const API_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-5.4-mini'

export function useOpenAI() {
  const store = useAppStore()

  async function chat(messages, jsonMode = false) {
    const body = {
      model: MODEL,
      messages,
      temperature: 0.7,
    }
    if (jsonMode) {
      body.response_format = { type: 'json_object' }
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${store.apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `API error ${res.status}`)
    }

    const data = await res.json()
    return data.choices[0].message.content
  }

  /**
   * One-time init: send full text + concept list, get back concept objects
   * with known=false. Returns array of {label, known} objects.
   */
  async function initRubberDuck(fullText, conceptLabels) {
    const prompt = [
      {
        role: 'system',
        content:
          'You are a learning assistant. Return only valid JSON.',
      },
      {
        role: 'user',
        content: `Here is a learning text:\n\n${fullText}\n\nHere are the key concepts a learner should cover:\n${conceptLabels.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nReturn a JSON object with a single key "concepts" containing an array of objects, each with "label" (string) and "known" (boolean, always false to start).`,
      },
    ]
    const raw = await chat(prompt, true)
    const parsed = JSON.parse(raw)
    return parsed.concepts || conceptLabels.map(label => ({ label, known: false }))
  }

  /**
   * Rubber duck teaching turn.
   * Returns { reply: string, updatedConcepts: [{label, known}], progress: number }
   */
  async function rubberDuckTurn(fullText, userMessage, concepts, recentMessages) {
    const knownCount = concepts.filter(c => c.known).length
    const pct = Math.round((knownCount / concepts.length) * 100)
    const unknownList = concepts.filter(c => !c.known).map(c => c.label)
    const knownList = concepts.filter(c => c.known).map(c => c.label)

    const systemPrompt = `You are a curious rubber duck who is learning about a topic from the user. You understand nothing yet — you need the user to teach you.

Your job:
- Ask targeted questions about concepts you don't yet understand
- When the user explains something well, acknowledge it and update your understanding
- Do NOT explain things yourself — only ask questions and react to what the user tells you
- Keep responses short (2-4 sentences max)
- Be warm and encouraging

You must also return a JSON object tracking what you've learned.

Concepts not yet understood: ${unknownList.join(', ') || 'none — you know everything!'}
Concepts already understood: ${knownList.join(', ') || 'none yet'}
Current understanding: ${pct}%

The reference text is: """${fullText.slice(0, 3000)}"""

Respond with JSON in this exact shape:
{
  "reply": "your conversational response to the user",
  "learnedConcepts": ["concept label 1", "concept label 2"]
}
Where "learnedConcepts" is a list of concept labels the user's latest message has adequately explained (use exact labels from the concepts list).`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.slice(-6),
      { role: 'user', content: userMessage },
    ]

    const raw = await chat(messages, true)
    const parsed = JSON.parse(raw)

    const updatedConcepts = concepts.map(c => ({
      ...c,
      known: c.known || (parsed.learnedConcepts || []).includes(c.label),
    }))

    const newKnownCount = updatedConcepts.filter(c => c.known).length
    const newProgress = Math.round((newKnownCount / updatedConcepts.length) * 100)

    return {
      reply: parsed.reply || "Tell me more!",
      updatedConcepts,
      progress: newProgress,
    }
  }

  /**
   * Non-intrusive chat during skim/read phases.
   */
  async function freeChat(userMessage, fullText, recentMessages) {
    const messages = [
      {
        role: 'system',
        content: `You are a helpful learning assistant. The user is reading the following text:\n\n${fullText.slice(0, 3000)}\n\nAnswer their questions helpfully and concisely. Encourage curiosity.`,
      },
      ...recentMessages.slice(-6),
      { role: 'user', content: userMessage },
    ]
    return await chat(messages, false)
  }

  return { initRubberDuck, rubberDuckTurn, freeChat }
}
