require('dotenv').config();
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

const getDeliveryDate = (orderId: number): string => {
  for (const delivery of deliveries) {
    if (delivery.orderId === orderId) {
      return delivery.date;
    }
  }
  return '';
};

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
  ];

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a helpful customer support assistant. Use the supplied tools to assist the user." },
    { role: "user", content: "Hi, can you tell me the delivery date for my order?" },
    { role: "assistant", content: "Sure, I can help with that. What is your order ID?" },
    { role: "user", content: "My order ID is 345." },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages,
    tools: tools,
  });

  if (response) {
    console.log(response);
    // Extract the arguments for get_delivery_date
    // Note this code assumes we have already determined that the model generated a function call. See below for a more production ready example that shows how to check if the model generated a function call
    const toolCall = response.choices[0].message.tool_calls?.[0];
    const args = toolCall?.function.arguments;
    const parsedArgs = JSON.parse(args || '') as { orderId: string };
    const orderId = parsedArgs.orderId;

    // Call the getDeliveryDate function with the extracted orderId
    const deliveryDate = getDeliveryDate(Number(orderId));

    console.log(`The delivery date for order ${orderId} is ${deliveryDate}`);
  }
}

main();
