import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Body from './components/Body'
import FeedBackModal from './components/FeedBackModal';
import axios from 'axios'

function App() {
    const [dark,setDark] =React.useState(true);
    React.useEffect(
        ()=>{
            axios.post("https://back.colider.app/feedback",{
            message:"user"
            })
        },[]
    )
    return(
      <div className={` ${dark?'bg-prime-dark':'bg-white'} hide-scroll overflow-x-auto`}>
        <FeedBackModal />
        <div data-bs-toggle="modal"
          data-bs-target="#feedback" style={{cursor:'pointer' ,position:'fixed',bottom:0,right:0,zIndex:'10000',opacity:0.3}} className={` mb-0 d-none d-md-block px-2 m-0  p-0 text-${dark?'white':'black'}`}>
          report <i className="bi ms-1 bi-exclamation-circle"></i></div>
        <Body dark={dark} setDark={setDark}/>
      </div>
    )
}

export default App
