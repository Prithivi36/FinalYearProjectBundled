import axios from 'axios';
import React, { useState } from 'react';

const JoinRoomModal = (props) => {
  const [roomCode, setRoomCode] = useState('');
  const [name,setName] =useState('');

  const handleJoin = () => {

    if (roomCode.trim()) {
      sessionStorage.setItem('room',roomCode)
      sessionStorage.setItem('userId',name)
      axios.get("http://135.235.196.75:8081/rtcToken?channelName="+roomCode).then(
        res=>{
          sessionStorage.setItem('agora-token',res.data.key)
        }
      ).
      then(
        res=>location.reload()
      )
    }
  };

  return (
    <>
      <div
        className="modal fade"
        id="joinRoomModal"
        tabIndex="-1"
      >
        <div style={{maxWidth:'400px'}} className=" modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content overflow-hidden">
            <div className={`modal-body p-3 py-5`}>
            <p style={{fontFamily:'revert-layer'}} className='fw-medium  fs-5 text-center'><span className='fs-1'>🔐</span> Enter room-secret</p>
              <p className='text-warning text-center mb-3'>Make sure you're on a strong network for the best experience <span className='text-primary fw-medium'>{"</>"}</span> </p>
              <div className="inps p-3">
                <input
                  style={{fontFamily:"monospace"}}
                  type="text"
                  className={`form-control-cust`}
                  placeholder="Room Code..."
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                />
                <input
                  type="text"
                  className={`form-control-cust mt-3`}
                  placeholder="Username..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            <div className='align-items-center justify-content-center mt-4 gap-3 d-flex' >
              <button
                type="button"
                className={`btn btn-outline-secondary px-3 py-2 `}
                data-bs-dismiss="modal"
              >
                ❌ Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary px-3 py-2"
                onClick={handleJoin}
                data-bs-dismiss="modal"
              >
                🚀 Join
              </button>
            </div>
            </div>


          </div>
        </div>
      </div>
    </>
  );
};

export default JoinRoomModal;
