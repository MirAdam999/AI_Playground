"use client"
import './userMsg.css'
import { regFont } from '@/comps/fonts';

type MessageProps = {
    data: string;
};

export default function UserMesaage({ data }: MessageProps) {
    return (
        <div id='user-msg' className={regFont.className}>
            {data}
        </div>
    )
}