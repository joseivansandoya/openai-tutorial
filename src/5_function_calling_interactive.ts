require('dotenv').config();
import { input } from '@inquirer/prompts';
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey,
});

// mock deliveries
const deliveries = [
  { deliveryId: 1, orderId: 123, name: 'A', phoneNumber: '123', date: '2021-01-01' },
  { deliveryId: 2, orderId: 345, name: 'B', phoneNumber: '456', date: '2021-01-02' },
  { deliveryId: 3, orderId: 465, name: 'C', phoneNumber: '789', date: '2021-01-03' },
];
// mock orders
const orders = [
  { orderId: 123, items: ['iPhone16', 'airpods'], total: 1400, provider: 'Apple' },
  { orderId: 345, items: ['iPhone16', 'airpods'], total: 1400, provider: 'Apple 2' },
  { orderId: 465, items: ['iPhone16', 'airpods'], total: 1400, provider: 'Apple 3' },
];

const getDeliveryDate = (args: { orderId: string }): string => {
  const { orderId } = args;
  for (const delivery of deliveries) {
    if (delivery.orderId === Number(orderId)) {
      return delivery.date;
    }
  }
  return '';
};

const getOrderDetails = (args: { orderId: string }): string => {
  const { orderId } = args;
  for (const order of orders) {
    if (order.orderId === Number(orderId)) {
      return JSON.stringify(order);
    }
  }
  return '';
};

const functionsMap = new Map<string, Function>();
functionsMap.set('getDeliveryDate', getDeliveryDate);
functionsMap.set('getOrderDetails', getOrderDetails);

async function main() {
  const tools: OpenAI.ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "getDeliveryDate",
        description: "Get the delivery date for a customer's order. Call this whenever you need to know the delivery date, for example when a customer asks 'Where is my package'",
        parameters: {
          type: "object",
          properties: {
            orderId: {
              type: "string",
              description: "The ID of the order",
            },
          },
          required: ["orderId"],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "getOrderDetails",
        description: "Get the details of a customer's order. Call this whenever you need to know the details of an order, for example when a customer asks 'What did I order?' or 'How much did I pay?' or 'Who did I order from?' or 'What are the details of my order?'",
        parameters: {
          type: "object",
          properties: {
            orderId: {
              type: "string",
              description: "the stringified details of the order (items, total, provider)",
            },
          },
          required: ["orderId"],
          additionalProperties: false,
        },
      },
    }
  ];

  const initialAssistantMessage = '>>> What can I help with? (type "exit" to end assistant)';
  let prompt = await input({ message: initialAssistantMessage });

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a helpful customer support assistant. Use the supplied tools to assist the user." },
    { role: "assistant", content: initialAssistantMessage },
    { role: "user", content: prompt },
  ];

  let isFunctionCallTurn = false;
  while (prompt !== 'exit') {
    if (isFunctionCallTurn) {
      console.log('[Function call]');
    } else {
      console.log('...');
    }
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      tools: tools,
    });

    if (response) {
      // check if the assistant is calling a function
      if (response.choices[0].message.tool_calls?.[0]) {
        const toolCall = response.choices[0].message.tool_calls?.[0];
        const functionName = toolCall.function.name;
        const functionArguments = JSON.parse(toolCall.function.arguments);

        // get the function from the map
        const fn = functionsMap.get(functionName);
        if (fn) {
          isFunctionCallTurn = true;
          const functionCallResult = fn(functionArguments);
          const functionCallResultMessage: OpenAI.ChatCompletionToolMessageParam = {
            role: "tool",
            content: JSON.stringify({
              ...functionArguments,
              result: functionCallResult,
            }),
            tool_call_id: toolCall.id,
          };

          // add the tool call and result to the messages
          messages.push(response.choices[0].message);
          messages.push(functionCallResultMessage);
        }
      } else {
        const content = response.choices[0].message.content;
        console.log(`>>> Assistant: ${content}`);
        prompt = await input({ message: '>>> You (type "exit" to end assistant):' });
        messages.push({ role: "assistant", content });
        messages.push({ role: "user", content: prompt });

        isFunctionCallTurn = false;
      }
    }
  }

  console.log('>>> Goodbye!');
}

main();
