import fetch from "node-fetch";

import dotenv from "dotenv";

dotenv.config();  // Loads environment variables from .env

const HF = process.env.HUGGING_FACE_API_KEY;


async function query(data) {
    const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
            headers: {
                Authorization: `Bearer ${HF}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result;
}

query({
    messages: [
        {
            role: "user",
            content: "What is my name?",
        },
    ],
    model: "katanemo/Arch-Router-1.5B:hf-inference",
}).then((response) => {
    console.log(JSON.stringify(response));
});