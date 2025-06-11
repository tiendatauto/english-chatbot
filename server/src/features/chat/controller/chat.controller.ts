import { Request, Response } from 'express'
import OpenAI from 'openai'
import { HTTP_STATUS } from '~/constants/http'
import 'dotenv/config'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

class ChatController {
  public async chat(req: Request, res: Response) {
    const { message } = req.body

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an English teacher helping learners improve their speaking and reflexes in English. Always reply **only in English**, no matter what language the user uses. Stay strictly within the context of English speaking practice and conversation training. Do not translate, explain in other languages, or switch context.`
          },
          { role: 'user', content: message }
        ]
      })

      res.status(HTTP_STATUS.OK).json({ reply: completion.choices[0].message.content })
    } catch (error) {
      console.error(error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'OpenAI Error' })
    }
  }
}

export const chatController: ChatController = new ChatController()
