'use client'
import './querybox.css'
import { regFont } from '@/comps/fonts';
import { MdOutlineKeyboardDoubleArrowUp } from "react-icons/md";
import { useRef, useContext, useState } from 'react';
import { AppContext } from '@/app/context/AppContext';

export default function QueryBox({ }) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { currentChat, setCurrentChat } = useContext(AppContext)
    const [input, setInput] = useState("");

    const handleInput = () => {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        let userMessage = textareaRef.current?.value
        setCurrentChat(prev => [...prev, userMessage]);
        `if (!input.trim()) return;

        // 1. Add user's message immediately
        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: "user",
            text: input,
        };

        // 2. Add “thinking ...” message
        const loadingMsg: Message = {
            id: crypto.randomUUID(),
            role: "bot",
            text: "Thinking...",
            loading: true,
        };

        setCurrentChat((prev) => [...prev, userMsg, loadingMsg]);

        const userInput = input;
        setInput(""); // clear input

        // 3. Send to backend
        const res = await fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({ prompt: userInput }),
        });

        const data = await res.json();

        // 4. Replace the loading message with real response
        setCurrentChat((prev) =>
            prev.map((m) =>
                m.id === loadingMsg.id
                    ? { ...m, text: data.reply, loading: false }
                    : m
            )
        );`
    };

    return (
        <div id='querybox'>
            <form id='querybox-form' onSubmit={sendMessage}>
                <textarea
                    ref={textareaRef}
                    placeholder="Ask me anything"
                    id='query-input'
                    maxLength={1000}
                    className={regFont.className}
                    onInput={handleInput}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" id="submit-btn"><MdOutlineKeyboardDoubleArrowUp /></button>
            </form>
        </div>
    )
}