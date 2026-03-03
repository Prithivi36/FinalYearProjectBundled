import React from 'react'
import { connectNotepadSocket, sendNotes } from '../stomp/Stomp';
import AIIntelligence from './AIIntelligence';
import ImproveCode from './ImproveCode';


const Notepad = (props) => {
  const roomCode = sessionStorage.getItem('room');
  const[notes,setNotes]=React.useState('')
  const[activeTab,setActiveTab]=React.useState('notepad')
  React.useEffect(
    ()=>{
            props.comeback(true)
            if(roomCode!=null){
                connectNotepadSocket(roomCode,setNotes)
            }
        },[]
    )
    function handleChange(e){
        setNotes(e.target.value)
        sendNotes(roomCode,e.target.value,sessionStorage.getItem('userId'))
    }
  return (
    <>
      <div style={{transition:'height 0.9s ease',height:props.full?'100%':'50%'}} className={`  ${props.dark?'bg-prime-dark border-dark shad-dark':'bg-white shad'} border-1  rounded-5 overflow-hidden`}>
        <div className={` ${props.dark?'bg-darkmode border-dark':'bg-light'} d-flex align-items-center justify-content-between border-bottom   p-4`}>
        <div className="d-flex gap-3 align-items-center">
          <p style={{cursor:'pointer'}} onClick={()=>setActiveTab('notepad')} className={`${activeTab==='notepad'?'text-primary':''} ps-2 m-0 pb-0 fw-medium`}> <i className='bi bi-journal-text text-primary me-2 fw-medium'></i>Notepad</p>
          <div className="">|</div>
          <p style={{cursor:'pointer'}} onClick={()=>setActiveTab('ai')} className={`${activeTab==='ai'?'text-primary':''} ps-2 m-0 pb-0 fw-medium`}> <i className='bi bi-stars text-primary me-2 fw-medium'></i>AI Intelligence</p>
          <div className="">|</div>
          <p style={{cursor:'pointer'}} onClick={()=>setActiveTab('improve')} className={`${activeTab==='improve'?'text-primary':''} ps-2 m-0 pb-0 fw-medium`}> <i className='bi bi-magic text-primary me-2 fw-medium'></i>Improve</p>
        </div>
        <p style={{cursor:'pointer'}} onClick={props.setFull} className='m-0 pe-3 d-md-block d-none '><i   className={`bi ${!props.full?'bi-fullscreen':'bi-fullscreen-exit  '} m-0 p-0`}></i></p>
        </div>
        {activeTab==='notepad' && (
        <div className={` ${props.dark?'bg-prime-dark':'bg-white '} p-3 h-75 `}>
        <textarea style={{fontFamily:'revert-layer',background:'inherit',color:'inherit'}} value={notes} onChange={handleChange} placeholder='Questions, Discussions, ideas and more' className='border-0 w-100 notes h-100 ' name="" id=""></textarea>
        </div>
        )}
        {activeTab==='ai' && (
        <div className={` ${props.dark?'bg-prime-dark':'bg-white '} h-75 `}>
          <AIIntelligence dark={props.dark} code={props.editorCode} language={props.editorLanguage} onInjectCode={props.onInjectCode} />
        </div>
        )}
        {activeTab==='improve' && (
        <div className={` ${props.dark?'bg-prime-dark':'bg-white '} h-75 `}>
          <ImproveCode dark={props.dark} code={props.editorCode} language={props.editorLanguage} onInjectCode={props.onInjectCode} />
        </div>
        )}
    </div>
    </>
  )
}

export default Notepad
