import React from 'react'
import step1 from '../assets/step1.png'
import step2 from '../assets/step2.png'
import step3 from '../assets/step3.png'

export default function ManualModal() {
  return (
    <div id='manual' className='modal fade'>
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content">
            <div className="modal-body ">
                <div className="ins d-lg-flex justify-content-center align-items-center gap-5">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                        <img src={step1} className='img-fluid col-6 img-box' />
                        <p className='text-center'><span className="fw-medium col-6 text-primary">1.</span> <span className="fw-medium">Create a Room:</span> Enter a unique room code<span>(your choice)</span> and your username to start.</p>
                    </div>
                    <div className="d-flex flex-column align-items-center justify-content-center">
                        <img src={step2} className='img-fluid col-6 img-box' />
                        <p className='text-center'><span className="fw-medium col-6 text-primary text-nowrap">2.</span> <span className="fw-medium">Invite Friends:</span> Share the room code with your friends.</p>
                    </div>
                    <div className="d-flex flex-column align-items-center justify-content-center">
                        <img  src={step3} className='img-fluid col-6 img-box' />
                        <p className='text-center'><span className="fw-medium col-6 text-primary">3.</span> <span className="fw-medium">Join Together:</span> Friends enter the same code and click "Join Room" to collaborate.</p>
                    </div>
                </div>
                <p className='text-end'>
                    <button data-bs-toggle='modal' data-bs-target='#joinRoomModal'  className="text-primary text-end btn">next {">>"}</button>
                </p>
            </div>
        </div>
      </div>
    </div>
  )
}
