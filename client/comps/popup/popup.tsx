import './popup.css'

type PopUpProps = {
    element: string;
    closePopUp: () => void;
};

export default function PopUp({ element, closePopUp }: PopUpProps) {

    return (
        <div id='popup-backround'>
            <div id="popup-inner">
                <button id="close-btn" onClick={closePopUp}></button>
                {element === 'logIn' && <div></div>}
                {element === 'signUp' && <div></div>}
                {element === 'info' && <div></div>}
            </div>
        </div>
    )
}