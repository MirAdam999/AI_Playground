"use client";
import { ReactNode, useState } from "react";
import { AppContext, UsersHistory, ChatMessage } from "./AppContext";

type AppProviderProps = {
    children: ReactNode;
};

export default function AppProvider({ children }: AppProviderProps) {
    const API = "http://localhost:3000";
    const [token, setToken] = useState('');
    const [isLoggedIn, setLoggedIn] = useState(false);
    const [usersChatHistory, setUsersChatHistory] = useState<UsersHistory[]>([]);
    const [currentChat, setCurrentChat] = useState<ChatMessage[]>([]);
    const [currentChatID, setCurrentChatID] = useState('');

    return (
        <AppContext.Provider
            value={{
                API,
                token,
                setToken,
                isLoggedIn,
                setLoggedIn,
                usersChatHistory,
                setUsersChatHistory,
                currentChat,
                setCurrentChat,
                currentChatID,
                setCurrentChatID
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
