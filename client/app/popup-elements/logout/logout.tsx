"use client"
import { useContext, useState } from "react"
import { AppContext } from "@/app/context/AppContext";
import { roundedFont, regFont } from '@/comps/fonts';
import '../login/login.css'
import './logout.css'

type LogOutProps = {
    closePopUp: () => void;
};

export default function LogOutPopUp({ closePopUp }: LogOutProps) {
    const { API, setLoggedIn, setUsersChatHistory, setToken, token } = useContext(AppContext)
    const [fetching, setFetching] = useState(false)
    const [err, setErr] = useState('')

    const logOut = async () => {
        try {
            setErr('');
            setFetching(true);

            // call backend, include token in header
            let url = `${API}/user/log_out`;
            const res = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `${token}`
                }
            });

            if (res.status === 204) {
                setToken('');
                setUsersChatHistory([]);
                setLoggedIn(false);
                closePopUp();
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                console.error(data?.error);
                setErr('Oops, something went wrong! Please try again later.');
                return;
            }

        } catch (e) {
            console.error(e);
            setErr('Oops, something went wrong! Please try again later.');
        } finally {
            setFetching(false);
        }
    };


    return (
        <div className="logout">

            <h1 className={`${roundedFont.className}`}>Log Out?</h1>

            <div className="logout-btns">
                <button className={`${regFont.className}`} onClick={closePopUp} id="cancel">Cancel</button>
                <button className={`${regFont.className}`} onClick={logOut} id="logout">Log Out</button>
            </div>

            {err &&
                <div className='login-bottom'>
                    <p className={`${regFont.className} error`}>{err}</p>
                </div>}

            {fetching &&
                <div className='login-bottom'>
                    <div className="loader-login-signup"></div>
                </div>
            }
        </div>
    )
}