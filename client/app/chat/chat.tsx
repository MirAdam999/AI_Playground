"use client"
import { useContext, useState, useEffect, useRef } from "react"
import { AppContext } from "../context/AppContext";
import './chat.css'
import UserMesaage from "./chat_comps/userMsg/userMsg";
import BotMessage from "./chat_comps/botMsg/botMsg";
import Thinking from "./chat_comps/botMsg/thinking";
import SystemMessage from "./chat_comps/sysMsg/sysMsg";
import QueryBox from "./querybox/querybox";

export type ChatProps = {
    setError: React.Dispatch<React.SetStateAction<boolean>>;
    error: boolean;
    setThinking: React.Dispatch<React.SetStateAction<boolean>>;
    thinking: boolean;
    isOldChat: boolean;
    setIsOldChat: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Chat({ setError, error, setThinking, thinking, isOldChat, setIsOldChat }: ChatProps) {
    const { currentChat } = useContext(AppContext)
    const bottomRef = useRef<HTMLDivElement>(null)
    const [warning, setWarning] = useState(false)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        setError(false)
        setWarning(false)
    }, [currentChat]);

    return (
        <div id="chat" className={currentChat.length > 0 ? '' : 'starter-chat'}>

            <div id="chat-runner">
                {currentChat.length > 0 && currentChat.map((msg) => {
                    if (msg.type === 'user' && typeof msg.message === 'string') {
                        return <UserMesaage data={msg.message} />
                    }

                    if (msg.type === 'model' && typeof msg.message === 'object') {
                        return <BotMessage data={msg.message} isOldChat={isOldChat} />
                    }

                    return null
                })}

                {thinking && <Thinking />}

                {error && <SystemMessage type="err" />}

                {warning && <SystemMessage type="warning" />}

                <div ref={bottomRef} />
            </div>

            <QueryBox thinking={thinking} setThinking={setThinking} setError={setError} setWarning={setWarning} setIsOldChat={setIsOldChat} />

        </div>
    );
}