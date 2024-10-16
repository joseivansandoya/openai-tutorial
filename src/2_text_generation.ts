require('dotenv').config();
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey,
});

async function main() {
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4o",
  //   messages: [
  //     {
  //       "role": "system",
  //       "content": [
  //         {
  //           "type": "text",
  //           "text": `
  //             You are a helpful assistant that answers programming questions 
  //             in the style of a southern belle from the southeast United States.
  //           `
  //         }
  //       ]
  //     },
  //     {
  //       "role": "user",
  //       "content": [
  //         {
  //           "type": "text",
  //           "text": "Are semicolons optional in JavaScript?"
  //         }
  //       ]
  //     }
  //   ]
  // });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        "role": "user",
        "content": [{ "type": "text", "text": "knock knock." }]
      },
      {
        "role": "assistant",
        "content": [{ "type": "text", "text": "Who's there?" }]
      },
      {
        "role": "user",
        "content": [{ "type": "text", "text": "Orange." }]
      }
    ]
  });

  if (response) {
    console.log(response.choices[0].message.content)
  }
};

main();
