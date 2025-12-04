"use client"
import './botMsg.css'

export default function Thinking() {
    return (
        <div id='bot-msg'>
            <div id='left-bot-msg'><div className="loader" id='loader-left'></div></div>
            <div id='right-bot-msg'><div className="loader" id='loader-right'></div></div>
        </div>
    )
}