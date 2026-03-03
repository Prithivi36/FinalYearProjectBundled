import axios from 'axios'
import React from 'react'

const FeedBackModal = () => {
    const [rep,setRep]=React.useState("")
    function handleSubmit(){
        axios.post("https://back.colider.app/feedback",{
            message:rep
        }).catch(
            err=>alert("something went wrong")
        )
    }
  return (
    <div id='feedback' className='modal fade'>
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content">
            <div className="modal-body ">
                <label className='fw-medium mb-3' htmlFor="feedbacktext">What are the issue you experienced ?</label>
                <textarea onChange={(e)=>setRep(e.target.value)} placeholder='send bug report' id="feedbacktext" className='form-control' name="" ></textarea>
                <p onClick={handleSubmit} className='text-end'>
                    <button data-bs-dismiss='modal'  className="text-primary text-end btn">Submit</button>
                </p>
            </div>
        </div>
      </div>
    </div>
  )
}

export default FeedBackModal
