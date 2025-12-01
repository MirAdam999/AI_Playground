import { createContext } from "react";

export interface ModelMessage {
    katanemo: string;
    smol: string;
}

export interface ChatMessage {
    type: string;
    message: string | ModelMessage;
}

export interface UsersHistory {
    id: string;
    title: string;
}

interface AppContextType {
    API: string;

    token: string;
    setToken: React.Dispatch<React.SetStateAction<string>>;

    isLoggedIn: boolean;
    setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;

    usersChatHistory: UsersHistory[];
    setUsersChatHistory: React.Dispatch<React.SetStateAction<UsersHistory[]>>;

    currentChat: ChatMessage[];
    setCurrentChat: React.Dispatch<React.SetStateAction<ChatMessage[]>>;

    currentChatID: string;
    setCurrentChatID: React.Dispatch<React.SetStateAction<string>>;
}

export const AppContext = createContext<AppContextType>({
    API: "http://localhost:3000",

    token: "",
    setToken: () => { },

    isLoggedIn: false,
    setLoggedIn: () => { },

    usersChatHistory: [],
    setUsersChatHistory: () => { },

    currentChat: [],
    setCurrentChat: () => { },

    currentChatID: '',
    setCurrentChatID: () => { },
});