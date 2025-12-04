"use client"
import './botMsg.css'
import { ModelMessage } from "@/app/context/AppContext";
import { regFont } from '@/comps/fonts';

type MessageProps = {
    data: ModelMessage;
};

export default function BotMessage({ data }: MessageProps) {
    return (
        <div id='bot-msg' className={regFont.className}>
            <div id='left-bot-msg'>{data.smol}</div>
            <div id='right-bot-msg'>{data.katanemo}</div>
        </div>
    )
}