require('dotenv').config();

import { input } from '@inquirer/prompts';
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey,
});

async function main() {
  const initialAssistantMessage = '>>> What can I help with? (type "exit" to end assistant)';
  let prompt = await input({ message: initialAssistantMessage });

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a helpful assistant. Use the supplied tools to assist the user." },
    { role: "assistant", content: initialAssistantMessage },
    { role: "user", content: prompt },
  ];

  while (prompt !== 'exit') {
    console.log('...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
    });

    if (response) {
      const content = response.choices[0].message.content;
      console.log(`>>> Assistant: ${content}`);
      prompt = await input({ message: '>>> You (type "exit" to end assistant): ' });
      messages.push({ role: "assistant", content });
      messages.push({ role: "user", content: prompt });
    }
  }

  console.log('>>> Goodbye!');
}

main();
