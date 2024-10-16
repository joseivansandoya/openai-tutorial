require('dotenv').config();
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey,
});

async function chatCompletion() {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            {
                role: "user",
                content: "Introduce yourself.",
            },
        ],
    });
    console.log(completion.choices[0].message);
}

async function imageGeneration() {
    const image = await openai.images.generate({ prompt: "A cute baby sea otter" });
    console.log(image.data[0].url);
}

async function vectorEmbedding() {
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-large",
        input: "The quick brown fox jumped over the lazy dog",
    });
    console.log(embedding);
}

async function main() {
    await chatCompletion();

    // await imageGeneration();

    // await vectorEmbedding();
}

main();
