'use client'
import './page.css'
import PopUp from '@/comps/popup/popup';
import SidebarMobile from './sidebar/sidebar-mobile/sidebarMobile';
import SidebarPC from './sidebar/sidebar-pc/sidebarPC';
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

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768)
    checkScreen()
    window.addEventListener("resize", checkScreen)
    return () => window.removeEventListener("resize", checkScreen)
  }, []);

  useEffect(() => {
    if (isLoggedIn) setSidebar(true)
    setPopUp('')
  }, [isLoggedIn])

  const openLogIn = () => {
    setPopUp('logIn')
  }

  const openSignUp = () => {
    setPopUp('signUp')
  }

  const openInfo = () => {
    setPopUp('info')
  }

  const openNewChat = () => {
    setPopUp('newChat')
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

      {sidebar && (
        isMobile ?
          <SidebarMobile closeSidebar={closeSidebar} />
          : <SidebarPC closeSidebar={closeSidebar} />
      )}

      <div id="main">

        <div id="backdrop">
          <div className='backdrop-half' id="black"></div>
          <div className='backdrop-half' id="white"></div>
        </div>

        <div id='elements-parent'>
          <Header openLogIn={openLogIn} openSignUp={openSignUp} openInfo={openInfo} openNewChat={openNewChat} openSidebar={openSidebar} />

          <Hero />

          <Chat />

        </div>

      </div>

    </div>
  );
}
