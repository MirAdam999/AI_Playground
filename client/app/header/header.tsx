import './header.css';
import { roundedFont } from '@/comps/fonts';

type HeaderProps = {
    openLogIn: () => void;
    openSignUp: () => void;
    openInfo: () => void;
};


export default function Header({ openLogIn, openSignUp, openInfo }: HeaderProps) {

    return (
        <div id='header' >
            <div id='login-signup'>
                <button id='login-btn' className={roundedFont.className} onClick={openLogIn}>Log In</button>
                <button id='signup-btn' className={roundedFont.className} onClick={openSignUp}>Sign Up</button>
            </div>
            <div id='info-parent'>
                <button id='info-btn' className={roundedFont.className} onClick={openInfo}>i</button>
            </div>
        </div>
    )
}