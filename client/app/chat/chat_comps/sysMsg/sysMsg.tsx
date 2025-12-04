"use client"
import './sysMsg.css'
import { regFont } from '@/comps/fonts';
import { IoWarningOutline } from "react-icons/io5";

type MessageProps = {
    type: 'err' | 'warning';
};

export default function SystemMessage({ type }: MessageProps) {
    const text = {
        'err': 'An Error has occurred while fetching response. Please try again later.',
        'warning': `This conversation is getting a bit too long.
         Seeing as this is a pet project, a limitation has been set to 50 exchanges per conversation.
         You have reached 49 exchanges. You can keep chatting! But older context of the conversation will not be avilable to the bots.`
    }

    return (
        <div className={`${regFont.className} sysMsg`} id={type}>
            <IoWarningOutline />
            <p id='sys-txt'>{text[type]}</p>
        </div >
    )
}