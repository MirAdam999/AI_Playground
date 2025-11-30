"use client";
import { ReactNode, useState } from "react";
import { AppContext } from "./AppContext";

type AppProviderProps = {
    children: ReactNode;
};

export default function AppProvider({ children }: AppProviderProps) {
    const [API, setAPI] = useState('');
    const [token, setToken] = useState('');
    const [isLoggedIn, setLoggedIn] = useState(false);
    const [usersChatHistory, setUsersChatHistory] = useState<any[]>([]);
    const [currentChat, setCurrentChat] = useState<any[]>([]);

    return (
        <AppContext.Provider
            value={{
                API,
                setAPI,
                token,
                setToken,
                isLoggedIn,
                setLoggedIn,
                usersChatHistory,
                setUsersChatHistory,
                currentChat,
                setCurrentChat
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
