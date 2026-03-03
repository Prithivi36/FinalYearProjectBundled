import axios from 'axios';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let stompClient = null;
let currentSubscription = null
// const BASE_URL ='https://back.colider.app/ws'
const BASE_URL ='/ws'
export  const connectSocket = async (userId, onMessage) => {
  const socket = new SockJS(BASE_URL);
  stompClient = Stomp.over(socket);
  stompClient.debug=()=>{}
  await stompClient.connect({}, () => {
    if(currentSubscription){
      currentSubscription.unsubscribe();
    }
    currentSubscription=stompClient.subscribe(`/topic/room/${userId}`, (message) => {
      const msg = JSON.parse(message.body);
      onMessage(msg);
      
    });
    stompClient.send(`/app/room/${userId}/sync`, {},{})
  });
};
export const sendCode = (currUser, userId, content) => {
  if (!stompClient || !stompClient.connected) return;

  stompClient.send(`/app/room/${currUser}/edit`, {}, JSON.stringify({
    userId,
    content,
    timestamp: Date.now()
  }));
};
let userStomp = null;
export async function connectUserSocket(roomId,name,onMessage){
  const socket = new SockJS(BASE_URL)
    userStomp = Stomp.over(socket)
    userStomp.debug = () => {};

    await userStomp.connect({},()=>{
      userStomp.subscribe(`/topic/room/users/${roomId}`,(m)=>{
        const msg = JSON.parse(m.body)
        onMessage(msg);
        sessionStorage.setItem('users',JSON.stringify(msg))
      })
      userStomp.send(`/app/room/${roomId}/users/${name}`, {});

    })
  }

export function deleteUser(roomId,userId){
  axios.post(`/delete/${roomId}/${userId}`)
  sessionStorage.clear()
  location.reload();

}
let notepadClient =null;
export async function connectNotepadSocket(roomId,onMessage){
  const socket = new SockJS(BASE_URL)
  notepadClient=Stomp.over(socket)
  notepadClient.debug=()=>{}
    await notepadClient.connect({},()=>{
      notepadClient.subscribe(`/topic/room/${roomId}/notepad`,(m)=>{
        const msg = JSON.parse(m.body)
        if(msg.user!=sessionStorage.getItem('userId'))
          onMessage(msg.content);
      })
      notepadClient.send(`/app/room/${roomId}/sync/notepad`,{},{})
    })
}
export function sendNotes(roomId,content,userId){
  if(!notepadClient || !notepadClient.connected )return

  notepadClient.send(`/app/room/${roomId}/notepad`,{},JSON.stringify({
    content,
    user:userId
  }))
}
