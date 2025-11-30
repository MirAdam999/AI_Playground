"use client"
import './msg.css'

type MessageProps = {
    text: string;
};

export default function Message({ text }: MessageProps) {
    return (
        <div id='msg'>
            {text}
        </div>
    )
}