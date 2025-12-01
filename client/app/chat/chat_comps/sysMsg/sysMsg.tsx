"use client"

type MessageProps = {
    text: string;
    type: string;
};

export default function SystemMessage({ text, type }: MessageProps) {
    return (
        <div id='msg'>
            {text}
        </div>
    )
}