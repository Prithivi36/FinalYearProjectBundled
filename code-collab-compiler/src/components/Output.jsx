import React from 'react'

const Output = (props) => {
    const [inp,setInp]=React.useState(true);
    React.useEffect(
      ()=>{
        if(props.loading){
          setInp(false);
        }
      },[props.loading]
    )
  return (
    <>
      <div id='out' style={{transition:'height 0.9s ease',height:props.full?'100%':'50%'}} className={` ${props.dark?'border-dark shad-dark':'shad'}  rounded-5 mt-3 border-1  overflow-hidden`}>
          <div className={` ${props.dark?'bg-darkmode border-dark':'bg-light'} border-bottom  d-flex align-items-center justify-content-between  p-4`}>
            <div className="d-flex gap-3">
              <p style={{cursor:'pointer'}} onClick={()=>setInp(true)}  className={`${inp?'text-primary':''} ps-2 m-0 pb-0 fw-medium`}> <i className='bi bi-input-cursor text-primary me-2 fw-bolder'></i>Input</p>
              <div className="">|</div>
              <p style={{cursor:'pointer'}} onClick={()=>setInp(false)} className={`${inp?'':'text-primary'} ps-2 m-0 pb-0 fw-medium`}> <i className='bi bi-terminal text-primary me-2 fw-medium'></i>Output</p>
            </div>
            <p style={{cursor:'pointer'}} onClick={props.setFull} className='m-0 pe-3 d-md-block d-none '><i   className={`bi  ${props.dark?'text-light':'text-dark'}  ${!props.full?'bi-fullscreen':'bi-fullscreen-exit  '} m-0 p-0`}></i></p>
          </div>
          {!inp&&<div className={` ${props.dark?'bg-prime-dark':'bg-white'} p-3 h-75`}>
           {props.output.code!=null &&   <div className="">
                {props.output.code==0?<p className='m-0 text-success fw-bolder'>Compilation Successful</p>:<p className='m-0 text-danger fw-bolder'>{props.output.code==1?'Compilation':'Runtime'} Error</p>}
              </div>}
            <textarea style={{fontFamily:'monospace',background:'inherit',color:'inherit'}} placeholder={props.loading?'compiling .....':'Run to see output'} value={props.loading?"compiling ....":props.output.output||""} disabled className={`${props.output.code==1?'text-danger ':'fw-normal '}border-0  w-100 notes h-100`} name="" id=""></textarea>
          </div>}
          {inp&&<div className={` ${props.dark?'bg-prime-dark':'bg-white'} p-3 h-75`}>
            <textarea value={props.stdin} style={{fontFamily:'monospace',background:"inherit",color:'inherit'}}  onChange={props.handleChange} placeholder={`Enter input here...\nProvide before running if required ⚠️ `}  className='border-0  w-100 notes h-100' name="" id=""></textarea>
          </div>}
        </div>
    </>
  )
}

export default Output
