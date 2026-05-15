import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const BACKEND_URL = "https://mk-chat-backend.onrender.com"; 
const socket = io(BACKEND_URL);

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (isLoggedIn) {
      axios.get(`${BACKEND_URL}/messages`)
        .then(res => setChat(res.data))
        .catch(err => console.log("Error loading messages:", err));

      socket.on("receive_message", (data) => {
        setChat((prev) => [...prev, data]);
      });
    }
    return () => socket.off("receive_message");
  }, [isLoggedIn]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      const msgData = { sender: username, content: message };
      socket.emit("send_message", msgData);
      setMessage("");
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', backgroundColor:'#1a202c', color:'white', fontFamily:'sans-serif'}}>
        <h1 style={{fontSize:'3.5rem', marginBottom:'1rem', color:'#63b3ed'}}>MK CHAT</h1>
        <p style={{marginBottom:'20px', opacity:'0.8'}}>Enter your name to start chatting</p>
        <input 
          style={{padding:'12px 20px', borderRadius:'25px', border:'none', width:'280px', fontSize:'1rem', outline:'none'}}
          placeholder="Your Name..." 
          value={username}
          onChange={(e) => setUsername(e.target.value)} 
        />
        <button 
          style={{marginTop:'20px', padding:'12px 40px', backgroundColor:'#3182ce', color:'white', border:'none', borderRadius:'25px', cursor:'pointer', fontWeight:'bold', fontSize:'1rem'}}
          onClick={() => username.trim() && setIsLoggedIn(true)}
        >
          JOIN CHAT
        </button>
      </div>
    );
  }

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100vh', backgroundColor:'#edf2f7', fontFamily:'sans-serif'}}>
      <header style={{backgroundColor:'#2b6cb0', color:'white', padding:'15px 25px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
        <span style={{fontSize:'1.5rem', fontWeight:'bold'}}>MK CHAT</span>
        <span style={{fontSize:'0.9rem', opacity:'0.9'}}>User: {username}</span>
      </header>
      
      <div style={{flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:'10px'}}>
        {chat.map((msg, i) => (
          <div key={i} style={{alignSelf: msg.sender === username ? 'flex-end' : 'flex-start', maxWidth:'75%'}}>
            <div style={{
              padding:'10px 15px', 
              borderRadius:'18px', 
              backgroundColor: msg.sender === username ? '#3182ce' : 'white', 
              color: msg.sender === username ? 'white' : 'black',
              boxShadow:'0 2px 5px rgba(0,0,0,0.05)',
              borderBottomRightRadius: msg.sender === username ? '2px' : '18px',
              borderBottomLeftRadius: msg.sender === username ? '18px' : '2px'
            }}>
              <div style={{fontSize:'0.7rem', fontWeight:'bold', marginBottom:'4px', opacity:0.8}}>{msg.sender}</div>
              <div style={{wordBreak:'break-word'}}>{msg.content}</div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} style={{padding:'20px', backgroundColor:'white', display:'flex', alignItems:'center', gap:'10px', borderTop:'1px solid #e2e8f0'}}>
        <input 
          style={{flex:1, padding:'12px 20px', border:'1px solid #cbd5e0', borderRadius:'25px', outline:'none', fontSize:'1rem'}} 
          value={message} 
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..." 
        />
        <button type="submit" style={{backgroundColor:'#2b6cb0', color:'white', border:'none', padding:'12px 25px', borderRadius:'25px', cursor:'pointer', fontWeight:'bold'}}>SEND</button>
      </form>
    </div>
  );
}

export default App;
