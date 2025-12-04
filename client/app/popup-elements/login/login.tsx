"use client"
import { useContext, useState, useRef } from "react"
import { AppContext } from "@/app/context/AppContext";
import { roundedFont, regFont } from '@/comps/fonts';
import './login.css'

type LogInProps = {
    openSignUp: () => void;
};

export default function LogInPopUp({ openSignUp }: LogInProps) {
    const { API, setLoggedIn, setUsersChatHistory, setToken, token } = useContext(AppContext)
    const emailRef = useRef<HTMLInputElement>(null);
    const passRef = useRef<HTMLInputElement>(null);
    const [fetching, setFetching] = useState(false)
    const [err, setErr] = useState('')

    const logIn = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            setErr('');
            setFetching(true);

            // call backend, include token in header if there is one
            let url = `${API}/user/log_in`;
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (token.length > 0) {
                headers["Authorization"] = `${token}`;
            }
            const res = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    email: emailRef.current?.value,
                    pass: passRef.current?.value
                }),
            });

            const data = await res.json();
            if (!res.ok) {  // if code !200
                console.error(data.error)
                if (res.status === 400 || res.status === 401) {
                    setErr(data.error)
                } else {
                    setErr('Oops, something went wrong! Please try again later.')
                }
            } else {  // code 200
                setToken(data.userToken)
                setUsersChatHistory(data.chatHistory)
                setLoggedIn(true)
            }

        } catch (e) {
            console.error(e)
            setErr('Oops, something went wrong! Please try again later.')
        } finally {
            setFetching(false)
        }
    };


    return (
        <div className="login">

            <h1 className={`${roundedFont.className}`}>Log In</h1>

            <form className={`${regFont.className} login-signup-form`}
                onSubmit={logIn}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        logIn(e as unknown as React.FormEvent);
                    }
                }}>
                <label>Email</label>
                <input type='email'
                    className={`${regFont.className}`}
                    required
                    maxLength={50}
                    ref={emailRef}>
                </input>
                <label>Password</label>
                <input type='password'
                    className={`${regFont.className}`}
                    required
                    minLength={8}
                    maxLength={12}
                    ref={passRef}>
                </input>
                <button type="submit" className={`${regFont.className}`}>Log In</button>
            </form>

            {err &&
                <div className='login-bottom'>
                    <p className={`${regFont.className} error`}>{err}</p>
                </div>}

            {fetching ?
                <div className='login-bottom'>
                    <div className="loader-login-signup"></div>
                </div>
                :
                <div className='login-bottom'>
                    <p className={`${regFont.className}`}>Don't have an account?</p>
                    <button onClick={openSignUp} className={`${regFont.className}`}>Sign Up</button>
                </div>
            }
        </div>
    )
}