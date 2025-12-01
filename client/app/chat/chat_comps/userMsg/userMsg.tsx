"use client"
import './userMsg.css'

type MessageProps = {
    data: string;
};

export default function UserMesaage({ data }: MessageProps) {
    return (
        <div id='msg'>
            {data}
        </div>
    )
}