import './sidebar.css'
import { GoSidebarCollapse } from "react-icons/go";
import { useContext, useEffect } from "react"
import { AppContext } from "@/app/context/AppContext";
import { regFont } from '@/comps/fonts';
import { HiOutlineXMark } from "react-icons/hi2";

export type SidebarProps = {
    closeSidebar: () => void;
    isMobile: boolean;
    setError: React.Dispatch<React.SetStateAction<boolean>>;
    setThinking: React.Dispatch<React.SetStateAction<boolean>>;
    openDeleteChat: (chatID: string) => void;
    setIsOldChat: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({ closeSidebar, isMobile, setError, setThinking, openDeleteChat, setIsOldChat }: SidebarProps) {
    const {
        usersChatHistory,
        setCurrentChat,
        setCurrentChatID,
        token,
        API
    } = useContext(AppContext)

    useEffect(() => {
    }, [usersChatHistory])

    const fetchChat = async (chatID: string) => {
        try {
            setCurrentChat([]);
            setThinking(true);

            // call backend, include chatID in url param, include token in header
            let url = `${API}/chat/get_chat/${chatID}`;
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `${token}`
                },
            });

            const data = await res.json();
            if (!res.ok) {  // if code !200
                console.error(data.error)
                setError(true)
            } else {  // code 200
                setCurrentChatID(data.chatID)
                setThinking(false)
                setCurrentChat(data.chat)
                setIsOldChat(true)
            }

        } catch (e) {
            console.error(e)
            setError(true)
            setThinking(false)
        }
    };


    return (
        <div id={isMobile ? "sidebar-mobile" : "sidebar-pc"} className={`${regFont.className} sidebar`}>
            <div id='sidebar-top'>
                <h2>Previous Chats</h2>
                <button onClick={closeSidebar} id='close-sidebar'><GoSidebarCollapse /></button>
            </div>
            {usersChatHistory.length > 0 ?
                <div id='chat-history'>
                    {usersChatHistory.map((chat, i) => (
                        <div key={i} className='chat-title' onClick={() => fetchChat(chat.id)}>
                            <p>{chat.title}</p>
                            <div onClick={() => openDeleteChat(chat.id)}><HiOutlineXMark /></div>
                        </div>
                    ))}
                </div>
                : <div id='no-chat-history'><p className='no-old-chats'>No Previous Chats</p></div>}
        </div>
    )
}