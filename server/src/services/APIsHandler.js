import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// handles calls to Hugging Face API models

export class APIsHandler {
    static HF = process.env.HUGGING_FACE_API_KEY;
    static katanemoModel = "katanemo/Arch-Router-1.5B:hf-inference"
    static smolModel = "HuggingFaceTB/SmolLM3-3B:hf-inference"
    static API = "https://router.huggingface.co/v1/chat/completions"

    /**
    * @param {string} new_message 
    * @param {[{}]} context 
    * @returns {string | false} 
    */
    static async queryKatanemoModel(new_message, context) {
        let output = false
        try {
            context.push({ role: "user", content: new_message })
            let payload = { messages: context, model: this.katanemoModel }
            const response = await fetch(
                this.API,
                {
                    headers: {
                        Authorization: `Bearer ${this.HF}`,
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify(payload),
                }
            );
            const result = await response.json();

            if (!result) return false
            if (result.error) {
                output = result.error
                return false
            }
            output = result.choices[0].message.content
            return result.choices[0].message.content

        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`[ModelHandler] queryKatanemoModel(${new_message?.slice(0, 20)}) -> `, output)
        }
    }


    /**
    * @param {string} new_message 
    * @param {[{}]} context 
    * @returns {string | false} 
    */
    static async querySmolModel(new_message, context) {
        let output = false
        try {
            context.push({ role: "user", content: new_message })
            let payload = { messages: context, model: this.smolModel }
            const response = await fetch(
                this.API,
                {
                    headers: {
                        Authorization: `Bearer ${this.HF}`,
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify(payload),
                }
            );
            const result = await response.json();

            if (!result) return false
            if (result.error) {
                output = result.error
                return false
            }
            output = result.choices[0].message.content
            output = output.replace(/<think>[\s\S]*?<\/think>/, "").trim();
            return output

        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`[ModelHandler] querySmolModel(${new_message?.slice(0, 20)}) -> `, output)
        }
    }
}