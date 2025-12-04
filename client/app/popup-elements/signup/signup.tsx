"use client"
import { useContext, useState, useRef } from "react"
import { AppContext } from "@/app/context/AppContext";
import { roundedFont, regFont } from '@/comps/fonts';
import '../login/login.css'
import './signup.css'

export default function SignUpPopUp() {
    const { API, setLoggedIn, setToken, token } = useContext(AppContext)
    const emailRef = useRef<HTMLInputElement>(null);
    const passRef = useRef<HTMLInputElement>(null);
    const passRepeatRef = useRef<HTMLInputElement>(null);
    const [fetching, setFetching] = useState(false)
    const [err, setErr] = useState('')

    const signUp = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            if (passRef.current?.value !== passRepeatRef.current?.value) {
                setErr('Passwords do not match!')
            } else {
                setErr('');
                setFetching(true);

                // call backend, include token in header if there is one
                let url = `${API}/user/sign_up`;
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
                if (!res.ok) {  // if code !201
                    console.error(data.error)
                    if (res.status === 400) {
                        setErr(data.error)
                    } else {
                        setErr('Oops, something went wrong! Please try again later.')
                    }
                } else {  // code 201
                    setToken(data.userToken)
                    setLoggedIn(true)
                }
            }
        } catch (e) {
            console.error(e)
            setErr('Oops, something went wrong! Please try again later.')
        } finally {
            setFetching(false)
        }
    };

    return (
        <div className="signup">
            <h1 className={`${roundedFont.className}`}>Sign Up</h1>
            <form className={`${regFont.className} login-signup-form`}
                onSubmit={signUp}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        signUp(e as unknown as React.FormEvent);
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
                <label>Repeat Password</label>
                <input type='password'
                    className={`${regFont.className}`}
                    required
                    minLength={8}
                    maxLength={12}
                    ref={passRepeatRef}>
                </input>
                <p className={`${regFont.className}`}>Password must be 8–12 chars, and contain at least one lowercase, uppercase, and a number</p>
                <button type="submit">Sign Up</button>
            </form>

            {err &&
                <div className='login-bottom'>
                    <p className={`${regFont.className} error`}>{err}</p>
                </div>
            }

            {fetching &&
                <div className='login-bottom'>
                    <div className="loader-login-signup"></div>
                </div>
            }
        </div>
    )
}