"use client"
import { useContext } from "react"
import { AppContext } from "@/app/context/AppContext";
import './newChat.css'
import { roundedFont, regFont } from '@/comps/fonts';

type NewChatProps = {
    closePopUp: () => void;
    openSignUp: () => void;
    openLogIn: () => void;
};

export default function StartNewChatPopUp({ closePopUp, openSignUp, openLogIn }: NewChatProps) {
    const { setCurrentChat, setCurrentChatID } = useContext(AppContext)

    const handleNewChat = () => {
        setCurrentChat([])
        setCurrentChatID('')
        closePopUp()
    }

    return (
        <div className={`${regFont.className} new-chat`}>
            <h1 className={`${roundedFont.className}`}>Start New Chat?</h1>
            <p >This action will perminantly delete your current chat.<br />
                If you would like to avoid that, you can
                <button onClick={openLogIn} className={`${regFont.className} go-to-login-signup`} >Log In</button> or
                <button onClick={openSignUp} className={`${regFont.className} go-to-login-signup`} >Sign Up</button> to gain
                storage of up to 30 chats for up to 30 days.
            </p>
            <div className="new-chat-btns">
                <button onClick={closePopUp} className={`${roundedFont.className} cancel-btn`}>Cancel</button>
                <button className={`${roundedFont.className}`} id='start-new-chat-btn' onClick={handleNewChat}>Start New Chat</button>
            </div>
        </div>
    )
}   