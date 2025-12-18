'use client'
import './page.css'
import PopUp from '@/comps/popup/popup';
import Sidebar from './sidebar/sidebar';
import Header from './header/header';
import Hero from './hero/hero';
import Chat from './chat/chat';
import { useState, useContext, useEffect } from 'react';
import { AppContext } from './context/AppContext';

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [popUp, setPopUp] = useState('')
  const [sidebar, setSidebar] = useState(false)
  const { isLoggedIn } = useContext(AppContext)
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState(false)
  const [isOldChat, setIsOldChat] = useState(false)

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768)
    checkScreen()
    window.addEventListener("resize", checkScreen)
    return () => window.removeEventListener("resize", checkScreen)
  }, []);

  useEffect(() => {
    setPopUp('')
  }, [isLoggedIn])

  const openLogIn = () => {
    setPopUp('logIn')
  }

  const openSignUp = () => {
    setPopUp('signUp')
  }

  const openLogOut = () => {
    setPopUp('logOut')
  }

  const openInfo = () => {
    setPopUp('info')
  }

  const openNewChat = () => {
    setPopUp('newChat')
  }

  const openDeleteChat = (chatID: string) => {
    setPopUp(`delete ${chatID}`)
  }

  const closePopUp = () => {
    setPopUp('')
  }

  const openSidebar = () => {
    setSidebar(true)
  }

  const closeSidebar = () => {
    setSidebar(false)
  }

  return (
    <div id="home">

      {popUp !== '' && <PopUp element={popUp} closePopUp={closePopUp} openSignUp={openSignUp} openLogIn={openLogIn} />}

      {sidebar && <Sidebar closeSidebar={closeSidebar} isMobile={isMobile} setError={setError} setThinking={setThinking} openDeleteChat={openDeleteChat} setIsOldChat={setIsOldChat} />}

      <div id="main">

        <div id="backdrop">
          <div className='backdrop-half' id="black"></div>
          <div className='backdrop-half' id="white"></div>
        </div>

        <div id='elements-parent'>
          <Header openLogIn={openLogIn} openSignUp={openSignUp} openLogOut={openLogOut} openInfo={openInfo} openNewChat={openNewChat} openSidebar={openSidebar} />

          <Hero />

          <Chat setError={setError} error={error} setThinking={setThinking} thinking={thinking} isOldChat={isOldChat} setIsOldChat={setIsOldChat} />

        </div>

      </div>

    </div>
  );
}
