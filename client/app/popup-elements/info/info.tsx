import Link from 'next/link';
import './info.css'
import { roundedFont, regFont } from '@/comps/fonts';
import { RiRobot2Fill } from "react-icons/ri";
import { RiRobot2Line } from "react-icons/ri";

export default function InfoPopUp() {

    return (
        <div className={`${regFont.className} info`} >
            <h1 className={`${roundedFont.className}`}>Welcome to AI Playground!</h1>

            <p>
                A tool for comparing two text-generation AI models: Arch-Router (by Katanemo) and SmolLM3 (by HuggingFaceTB).
            </p>

            <p>To learn more about the models:</p>

            <Link className="model-link" href={'https://huggingface.co/katanemo/Arch-Router-1.5B'} target='_blank'>
                <RiRobot2Fill />
                <h4 className={`${roundedFont.className}`}>Arch-Router (by Katanemo)</h4>
            </Link>

            <Link className="model-link" href={'https://huggingface.co/HuggingFaceTB/SmolLM3-3B'} target='_blank'>
                <RiRobot2Line />
                <h4 className={`${roundedFont.className}`}>SmolLM3 (by HuggingFaceTB)</h4>
            </Link>

            <p>
                This system uses the HuggingFace API and is built by a solo developer- not a multi-million-dollar corporation.
                As a result, a few limitations apply:
            </p>

            <ul>
                <li>Conversation storage for up to 30 days (for registered users).</li>
                <li>Up to 30 stored conversations (for registered users).</li>
                <li>Conversations up to 50 user messages long.</li>
                <li>Rate limit: a 3-second break between requests.</li>
                <li>Up to 1,000 characters per user message.</li>
            </ul>

            <p>Thank you for your understanding — enjoy the playground!</p>

            <h4 id="sign" className={`${roundedFont.className}`}>Made by Miriam Adam, 2025</h4>
        </div>
    )
}