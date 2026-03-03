import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { createWandboxRequestBody } from "../functions/CreatePistonBody";
import axios from "axios";
import { connectSocket, sendCode } from "../stomp/Stomp";
import Audio from "./Audio";

let roomId = sessionStorage.getItem('room');
const userId = sessionStorage.getItem('userId')

export default function CodeEditor(props) {

  const defaultSnippets = {
    javascript: "// Write your JavaScript code here",
    python: "# Write your Python code here",
    cpp: "#include <iostream>\nint main() {\n  // Write your C++ code here\n  return 0;\n}",
    java: "class Main {\n  public static void main(String[] args) {\n    // Write your Java code here\n  }\n}",
    c: "#include <stdio.h>\nint main() {\n  // Write your C code here\n  return 0;\n}",
    go: "package main\nimport \"fmt\"\nfunc main() {\n  fmt.Println(\"Hello from Go\")\n}",
    csharp: "using System;\nclass Program {\n  static void Main() {\n    Console.WriteLine(\"Hello from C#\");\n  }\n}",
    ruby: "# Write your Ruby code here\ndef hello\n  puts 'Hello from Ruby'\nend\nhello",
    rust: "fn main() {\n  println!(\"Hello from Rust\");\n}"
  };

  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState(defaultSnippets[language]);
  const [loading,setLoading]=useState(false);

  const uid = props.uid

  React.useEffect(
    () => {
      if(roomId!=null){
          connectSocket(uid==-1?userId:props.user[uid], (msg) => {
            if(userId!=msg.userId){
              setCode(msg.content);
            }
          });
      }
  }, [uid]);

  // Accept injected code from AI Instructions
  React.useEffect(() => {
    if (props.injectedCode !== null && props.injectedCode !== undefined) {
      setCode(props.injectedCode);
      if (props.onCodeChange) props.onCodeChange(props.injectedCode);
      if (props.setInjectedCode) props.setInjectedCode(null);
    }
  }, [props.injectedCode]);




  function handleSubmit(){
    props.setLoading(true)

    // if(language=='java'){
    //   const body ={
    //     code:btoa(code),
    //     input:btoa(props.stdin)
    //   }
    //   axios.post("https://back.colider.app:8080/api/java",body).then(
    //       res=>{
    //         props.op({
    //           code:res.data.statusMes=="Successfully Compiled"?0:res.data.statusMes=="Runtime Error"?2:1,
    //           output:res.data.stdout||res.data.stderr
    //         })
    //         props.setLoading(false)
    //       }
    //   ).then(
    //     res=>props.setLoading(false)
    //   )
    //   .catch(
    //     err=>{alert("Something went wrong")
    //       props.setLoading(false)
    //     }
    //   )

    //   return;
    // }

    const body = createWandboxRequestBody(language, code, props.stdin)
    axios.post("https://wandbox.org/api/compile.ndjson", body, {
      responseType: 'text'
    }).then(
      res => {
        // Parse ndjson (newline-delimited JSON) response
        const lines = res.data.trim().split('\n').filter(l => l.trim());
        let stdout = '';
        let stderr = '';
        let exitCode = 0;

        for (const line of lines) {
          try {
            const obj = JSON.parse(line);
            if (obj.type === 'StdOut') {
              stdout += obj.data || '';
            } else if (obj.type === 'StdErr' || obj.type === 'CompilerMessageE') {
              stderr += obj.data || '';
            } else if (obj.type === 'ExitCode') {
              exitCode = parseInt(obj.data) || 0;
            } else if (obj.type === 'Control' && obj.data === 'Finish') {
              // done
            }
          } catch (e) {
            // skip malformed lines
          }
        }

        props.op({
          code: stderr && !stdout ? 1 : exitCode !== 0 ? 2 : 0,
          output: stdout || stderr || 'No output'
        })
      }
    ).then(
      res => props.setLoading(false)
    )
    .catch(
      err => {
        alert("Something went wrong : " + (err.message || 'Unknown error'))
        props.setLoading(false)
      }
    )
  }

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if(props.onLanguageChange) props.onLanguageChange(newLang);
    if(roomId==null)
    setCode(defaultSnippets[newLang] || "// Write your code here");
  };

  function handleChange(value){
    setCode(value);
    sendCode(uid==-1 ? userId:props.user[uid], userId, value);
    if(props.onCodeChange) props.onCodeChange(value);
  }
  
  return (
    <div style={{height:"85%"}} className={`overflow-hidden rounded-5 mt-3  ${props.dark?'border-dark shad-dark':' shad'} `}>
      <div className={`p-2 w-100 d-flex justify-content-between  ${props.dark?'bg-darkmode':'bg-light'}`}>
        <div className="d-flex gap-3 align-items-center justify-content-center ps-3 pt-2">
          <select
            className={`form-select  ${props.dark?'bg-prime-dark border-dark':'bg-white '}  border-1  ps-3`}
            onChange={handleLanguageChange}
            value={language}
            style={{ marginBottom: "10px", padding: "5px" }}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
          </select>
          {sessionStorage.getItem('agora-token')!=null && <Audio />}
          {uid === -1 || (
            <div style={{ display: "inline-block" }} className={`rounded-5 me-2 my-2 py-0 pb-0 btn ${props.user[uid]!=null?'btn-primary':'btn-warning'}`}>
              <p className="m-0 fw-normal text-nowrap mb-1 m-0 p-0">{props.user[uid] || 'left the room'}</p>
            </div>
          )}
        </div>
        <div className="d-flex align-items-center">
          <button onClick={props.editFull} className={`btn d-md-block d-none  btn-sm m-2 rounded-5  ${props.dark?'text-light':'text-dark'}`}>
            <i   className={`bi ${!props.full?'bi-fullscreen':'bi-fullscreen-exit '} m-0 p-0`}></i>
          </button>
          <div className="">
            <a href="#out" disabled={props.loading} onClick={handleSubmit} className="btn btn-success m-2 rounded-circle me-4 btn-sm"><i className="bi bi-play-fill"></i></a>
          </div>
        </div>
      </div>
      <Editor
        className={`overflow-hidden rounded-bottom-5 pt-3  ${props.dark?'border-dark':''} border-top`}
        height="100%"
        width="100%"
        language={language}
        value={code}
        beforeMount={(monaco)=>{
          monaco.editor.defineTheme("custom-dark",{
            base:"vs-dark",
            inherit:true,
            rules: [
        { token: "comment", foreground: "97FF80" },
        { token: "keyword", foreground: "8FFEFF" },
        { token: "string", foreground: "CE9178" },
      ],
      colors: {
        "editor.background": "#0A0E14",
        "editor.foreground": "#dcdfdbff",
        "editorLineNumber.foreground": "#F8FFF3",
        "editorCursor.foreground": "#FFFFFF",
      },
          })
        }}
        onChange={handleChange}
        theme={`${props.dark?'custom-dark':'vs-light'}`}
        options={{
            minimap: {
              enabled: false,
            },
            cursorBlinking:"expand",
      }}
      />
    </div>
  );
}
