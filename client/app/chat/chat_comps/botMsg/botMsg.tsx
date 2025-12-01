"use client"
import { ModelMessage } from "@/app/context/AppContext";

type MessageProps = {
    data: ModelMessage;
};

export default function BotMessage({ data }: MessageProps) {
    return (
        <div id='msg'>
            {data.katanemo}<br /><br /><br />
            {data.smol}
        </div>
    )
}