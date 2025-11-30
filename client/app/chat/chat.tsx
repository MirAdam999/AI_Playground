"use client"
import { useContext, useState, useEffect, useRef } from "react"
import { AppContext } from "../context/AppContext";
import './chat.css'
import Message from '@/comps/msg/msg';
import QueryBox from "./querybox/querybox";

export default function Chat() {
    const { currentChat } = useContext(AppContext)
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on each update
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentChat]);

    return (
        <div >

            {/* CHAT FEED */}
            <div >
                {currentChat.map((msg) => (
                    <Message text={msg} />
                ))}

                <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <QueryBox />

        </div>
    );
}