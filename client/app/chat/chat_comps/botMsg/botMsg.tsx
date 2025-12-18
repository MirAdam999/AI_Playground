"use client"
import { useEffect, useState } from 'react';
import './botMsg.css'
import { ModelMessage } from "@/app/context/AppContext";
import { regFont } from '@/comps/fonts';

type MessageProps = {
    data: ModelMessage;
    isOldChat: boolean;
};

export default function BotMessage({ data, isOldChat }: MessageProps) {
    const [smolTyped, setSmolTyped] = useState("");
    const [katTyped, setKatTyped] = useState("");

    useEffect(() => {
        let cancelled = false;
        if (!isOldChat) {
            setSmolTyped("");
            setKatTyped("");

            data.smol.split("").forEach((char, i) => {
                setTimeout(() => {
                    if (!cancelled) {
                        setSmolTyped(prev => prev + char);
                    }
                }, i * 30);
            });

            data.katanemo.split("").forEach((char, i) => {
                setTimeout(() => {
                    if (!cancelled) {
                        setKatTyped(prev => prev + char);
                    }
                }, i * 30);
            });

        } else {
            setSmolTyped(data.smol);
            setKatTyped(data.katanemo);
        }

        return () => {
            cancelled = true;
        };
    }, [data]);

    return (
        <div id='bot-msg' className={regFont.className}>
            <div id='left-bot-msg'>{smolTyped}</div>
            <div id='right-bot-msg'>{katTyped}</div>
        </div>
    )
}
