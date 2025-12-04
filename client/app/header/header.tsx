"use client"
import './header.css';
import { roundedFont } from '@/comps/fonts';
import { GoSidebarExpand } from "react-icons/go";
import { useContext } from "react"
import { AppContext } from "../context/AppContext";

type HeaderProps = {
    openLogIn: () => void;
    openSignUp: () => void;
    openInfo: () => void;
    openNewChat: () => void;
    openSidebar: () => void;
};


export default function Header({ openLogIn, openSignUp, openInfo, openNewChat, openSidebar }: HeaderProps) {
    const { isLoggedIn, setCurrentChat, setCurrentChatID } = useContext(AppContext)

    const handleNewChat = () => {
        if (isLoggedIn) {
            setCurrentChat([])
            setCurrentChatID('')
        } else {
            openNewChat()
        }
    }

    return (
        <div id='header' >
            {isLoggedIn ?
                <div className='header-left'>
                    <button id='sidebar-btn' onClick={openSidebar}><GoSidebarExpand /></button>
                </div>
                :
                <div className='header-left'>
                    <button id='login-btn' className={roundedFont.className} onClick={openLogIn}>Log In</button>
                    <button id='signup-btn' className={roundedFont.className} onClick={openSignUp}>Sign Up</button>
                </div>
            }
            <div className='header-right'>
                <button id='new-cht-btn' className={roundedFont.className} onClick={handleNewChat}>+ New Chat</button>
                <button id='info-btn' className={roundedFont.className} onClick={openInfo}>i</button>
            </div>
        </div>
    )
}