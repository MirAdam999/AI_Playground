'use client'
import './page.css'
import PopUp from '@/comps/popup/popup';
import Header from './header/header';
import Hero from './hero/hero';
import Chat from './chat/chat';
import { useState, useRef } from 'react';

export default function Home() {
  const [popUp, setPopUp] = useState('')

  const openLogIn = () => {
    setPopUp('logIn')
  }

  const openSignUp = () => {
    setPopUp('signUp')
  }

  const openInfo = () => {
    setPopUp('info')
  }

  const closePopUp = () => {
    setPopUp('')
  }

  return (
    <div id="home">

      {popUp !== '' && <PopUp element={popUp} closePopUp={closePopUp} />}

      <div id="sidebar"></div>

      <div id="main">

        <div id="backdrop">
          <div className='backdrop-half' id="black"></div>
          <div className='backdrop-half' id="white"></div>
        </div>

        <div id='elements-parent'>
          <Header openLogIn={openLogIn} openSignUp={openSignUp} openInfo={openInfo} />

          <Hero />

          <Chat />

        </div>

      </div>

    </div>
  );
}
