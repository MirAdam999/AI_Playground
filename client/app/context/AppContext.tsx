import { createContext } from "react";

interface AppContextType {
    API: string;
    setAPI: React.Dispatch<React.SetStateAction<string>>;

    token: string;
    setToken: React.Dispatch<React.SetStateAction<string>>;

    isLoggedIn: boolean;
    setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;

    usersChatHistory: any[];
    setUsersChatHistory: React.Dispatch<React.SetStateAction<any[]>>;

    currentChat: any[];
    setCurrentChat: React.Dispatch<React.SetStateAction<any[]>>;
}

export const AppContext = createContext<AppContextType>({
    API: "",
    setAPI: () => { },

    token: "",
    setToken: () => { },

    isLoggedIn: false,
    setLoggedIn: () => { },

    usersChatHistory: [],
    setUsersChatHistory: () => { },

    currentChat: [],
    setCurrentChat: () => { },
});