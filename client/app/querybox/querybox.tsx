import './querybox.css'
import { regFont } from '@/comps/fonts';
import { MdOutlineKeyboardDoubleArrowUp } from "react-icons/md";

export default function QueryBox() {

    return (
        <div id='querybox'>
            <form id='querybox-form'>
                <input type="text" placeholder="Ask me anything" id='query-input' className={regFont.className} />
                <button type="submit" id="submit-btn"><MdOutlineKeyboardDoubleArrowUp /></button>
            </form>
        </div>
    )
}