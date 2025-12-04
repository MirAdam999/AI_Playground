import './popup.css'
import InfoPopUp from '@/app/popup-elements/info/info';
import LogInPopUp from '@/app/popup-elements/login/login';
import SignUpPopUp from '@/app/popup-elements/signup/signup';
import StartNewChatPopUp from '@/app/popup-elements/new-chat/newChat';
import ApproveChatDeletionPopUp from '@/app/popup-elements/delete-chat/deleteChat';

type PopUpProps = {
    element: string;
    closePopUp: () => void;
    openSignUp: () => void;
    openLogIn: () => void;
};

export default function PopUp({ element, closePopUp, openSignUp, openLogIn }: PopUpProps) {

    return (
        <div id='popup-backround'>
            <div id="popup-inner">
                <button id="close-btn" onClick={closePopUp}>X</button>
                {element === 'logIn' && <LogInPopUp openSignUp={openSignUp} />}
                {element === 'signUp' && <SignUpPopUp />}
                {element === 'info' && <InfoPopUp />}
                {element === 'newChat' && <StartNewChatPopUp closePopUp={closePopUp} openLogIn={openLogIn} openSignUp={openSignUp} />}
            </div>
        </div >
    )
}