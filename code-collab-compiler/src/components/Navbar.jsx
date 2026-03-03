import React from 'react'
import JoinRoomModal from './JoinRoomModal'
import { deleteUser } from '../stomp/Stomp'
import ManualModal from './ManualModal'
import axios from 'axios'

const Navbar = (props) => {
  const roomId=sessionStorage.getItem('room')
  const userId=sessionStorage.getItem('userId')

  React.useEffect(() => {

    const handleTabClose = (event) => {

      if (roomId && userId) {
        event.preventDefault();
        event.returnValue=''
      }
    };
    const handleUnload =(event)=>{
      if(roomId && userId){
        sessionStorage.clear();
        navigator.sendBeacon(`https://back.colider.app/delete/${roomId}/${userId}`, "{}")
      }
    }

    window.addEventListener('beforeunload', handleTabClose);
    window.addEventListener('unload',handleUnload)
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
      window.removeEventListener('unload',handleUnload)
    };
  }, [roomId, userId]);

  return (
    <div style={{position:'absolute',left:'0',right:'0',top:'0'}} className={` ${props.dark?'bg-prime-dark shad-dark border-dark':'bg-white shad'}  border-bottom  py-3 d-flex align-items-center justify-content-between px-4`}>
      <h3 className='fw-medium text-nowrap m-0' >
        <span className='text-primary'><i className="bi bi-code-slash me-2"></i></span>
        CodeRooms
      </h3>
      <div className="actions  d-flex align-items-center">
        <button onClick={()=>props.setDark(p=>!p)} style={{color:'inherit'}} className='btn me-md-4 '><i className={`bi ${props.dark?'bi-moon-stars-fill':"bi-cloud-sun-fill"}`}></i></button>
        {roomId!=null?
          <div className="d-flex text-nowrap">
            <p className='m-0 p-0 fw-medium'><span className='text-primary fw-bolder'> {roomId} </span><i style={{cursor:'pointer'}}  onClick={()=>deleteUser(roomId,userId)}  className='bi bi-box-arrow-right text-center text-danger  px-md-3 py-2 rounded-5 m-0 fw-bolder'></i> </p>
          </div>
          
          :
          <button className="btn btn-outline-primary me-md-2"
          data-bs-toggle="modal"
          data-bs-target="#manual"
        >
            <i 
            data-bs-toggle="modal"
            data-bs-target="#manual"
            className="bi bi-people-fill me-2"></i>
            Join</button>}
          <JoinRoomModal dark={props.dark}  />
          <ManualModal dark={props.dark} />
        
      </div>
    </div>
  )
}

export default Navbar
