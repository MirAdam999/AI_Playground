'use client'
import './querybox.css'
import { regFont } from '@/comps/fonts';
import { MdOutlineKeyboardDoubleArrowUp } from "react-icons/md";
import { useRef, useContext, useState } from 'react';
import { AppContext, ChatMessage, ModelMessage } from '@/app/context/AppContext';

type QueryProps = {
    setThinking: (value: boolean) => void;
    setError: (value: boolean) => void;
    setWarning: (value: boolean) => void;
};

export default function QueryBox({ setThinking, setError, setWarning }: QueryProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const {
        setCurrentChat,
        isLoggedIn,
        API,
        token, setToken,
        currentChatID, setCurrentChatID,
        setUsersChatHistory
    } = useContext(AppContext)
    const [input, setInput] = useState("");

    const handleInput = () => {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    };

    const sendMessage = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            // push new user msg to current chat
            let userMessage: string = input || '';
            let newMessage: ChatMessage = { type: 'user', message: userMessage };
            setCurrentChat(prev => [...prev, newMessage]);

            setError(false);
            setThinking(true);
            setInput("");

            // call backend, include chatID in queryparam if there is one, include token in header if there is one
            let url = `${API}/chat/send_message`;
            if (currentChatID.length > 0) {
                const params = new URLSearchParams({ currentChatID });
                url += `?${params.toString()}`;
            }
            console.log('url', url)
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (token.length > 0) {
                headers["Authorization"] = `${token}`;
            }
            const res = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify({ msg: userMessage }),
            });

            const data = await res.json();
            if (!res.ok) {  // if code !201
                console.error(data.error)
                setError(true)
            } else {  // code 201
                if (!token || token.length === 0) setToken(data.token)
                if (!currentChatID || currentChatID.length === 0) setCurrentChatID(data.chatID)
                if (data.warning) setWarning(true)
                if (isLoggedIn) setUsersChatHistory(prev => [
                    ...prev,
                    { id: data.chatID, title: data.chatTitle }
                ]);

                setCurrentChat(prev => [
                    ...prev, {
                        type: 'model', message: {
                            katanemo: data.katanemoResponse,
                            smol: data.smolResponse
                        }
                    }]);
            }

        } catch (e) {
            console.error(e)
            setError(true)
        } finally {
            setThinking(false)
        }
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