import React from 'react'
import Editor from './Editor'
import Info from './Info'
import Output from './Output'
import Navbar from './Navbar'
import { connectUserSocket } from '../stomp/Stomp'
import Notepad from './Notepad'

const Body = (props) => {

    const [active,setActive]=React.useState(-1)
    const [output,setOutput]=React.useState({})
    const [code,setCode]=React.useState({})
    const [users,setUsers]=React.useState([])
    const [stdin,setStdIn]=React.useState("");
    const [loading,setLoading]=React.useState(false);
    const [notepart,setNotepart]=React.useState(true);
    const [outpad,setOutpad]=React.useState(true);
    const [edit,setedit]=React.useState(true);
    const [editorCode,setEditorCode]=React.useState('');
    const [editorLanguage,setEditorLanguage]=React.useState('java');
    const [injectedCode,setInjectedCode]=React.useState(null);

    const[editfull,setEditFull] =React.useState(false)
    React.useEffect(
      ()=>{
        if(sessionStorage.getItem('userId')!=null){
          const userId = sessionStorage.getItem('userId')
          connectUserSocket(sessionStorage.getItem('room'),userId,setUsers)
        }
      },[]
    )
    function toggleFull(){
      setedit(false)
      setEditFull(prev=>!prev)
      if(editfull==false)setedit(true)
    }
    function handleChange(e){
      setStdIn(e.target.value);
    }

  return (
    <div className={props.dark?'bg-prime-dark':'bg-white'}>
    <Navbar dark={props.dark} setDark={props.setDark} />
    <div style={{height:'10vh'}} className=" mb-3 mb-md-0"></div>
    <div  style={{height:'90vh'}}  className={`d-md-flex flex-row-reverse pt-4 ${props.dark?'bg-prime-dark':'bg-white'}`}>
      <div style={{height:'90vh'}} className={`smooth ${edit?'d-block':'d-none'} col-md  px-3 ${props.dark?'bg-prime-dark':'bg-white text-dark'}`}>
        <Info dark={props.dark} setDark={props.setDark} active={active} setActive={setActive} users={users} />
        <Editor code={code} setCode={setCode} dark={props.dark} setDark={props.setDark} full={editfull} editFull={toggleFull}  user={users} loading={loading} setLoading={setLoading} uid={active} op={setOutput} stdin={stdin} onCodeChange={setEditorCode} onLanguageChange={setEditorLanguage} injectedCode={injectedCode} setInjectedCode={setInjectedCode} />
      </div>
      {
        !editfull &&
        <div style={{height:'85vh'}} className={`col-md px-3 pb-3  ${props.dark?'bg-prime-dark':'bg-white'}`}>
          {notepart && 
          <Notepad dark={props.dark} setDark={props.setDark} full={!outpad} setFull={()=>setOutpad(!outpad)} comeback={setedit} editorCode={editorCode} editorLanguage={editorLanguage} onInjectCode={setInjectedCode}/>}
          {outpad&&
          <Output dark={props.dark} setDark={props.setDark} full={!notepart} setFull={()=>setNotepart(!notepart)} output={output} loading={loading} setLoading={setLoading} handleChange={handleChange} stdin={stdin} />}
        </div>
      }
    </div>
    </div>
  )
}

export default Body
