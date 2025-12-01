"use client"
import { useContext, useState, useEffect, useRef } from "react"
import { AppContext } from "../context/AppContext";
import './chat.css'
import UserMesaage from "./chat_comps/userMsg/userMsg";
import BotMessage from "./chat_comps/botMsg/botMsg";
import Thinking from "./chat_comps/botMsg/thinking";
import SystemMessage from "./chat_comps/sysMsg/sysMsg";
import QueryBox from "./querybox/querybox";

export default function Chat() {
    const { currentChat } = useContext(AppContext)
    const bottomRef = useRef<HTMLDivElement>(null)
    const [thinking, setThinking] = useState(false)
    const [error, setError] = useState(false)
    const [warning, setWarning] = useState(false)

    // Auto-scroll to bottom on each update
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentChat]);

    return (
        <div id="chat">

            <div id="chat-runner">
                {currentChat.map((msg) => {
                    if (msg.type === 'user' && typeof msg.message === 'string') {
                        return <UserMesaage data={msg.message} />
                    }

                    if (msg.type === 'model' && typeof msg.message === 'object' && msg.message !== null && 'katanemo' in msg.message && 'smol' in msg.message) {
                        return <BotMessage data={msg.message} />
                    }

                    return null
                })}

                {thinking && <Thinking />}

                {error && <SystemMessage text="err" type="err" />}

                {warning && <SystemMessage text="warning" type="warning" />}

                <div ref={bottomRef} />
            </div>

            <QueryBox setThinking={setThinking} setError={setError} setWarning={setWarning} />

        </div>
    );
}