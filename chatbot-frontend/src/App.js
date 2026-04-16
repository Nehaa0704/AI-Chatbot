import React, { useState } from "react";
import ChatBox from "./components/ChatBox";
import InputBox from "./components/InputBox";

function App() {
  const [messages, setMessages] = useState([]);

  const sendMessage = async (text) => {
    const userMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      const botMessage = {
        role: "assistant",
        text: data.reply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h1>Chatbot</h1>
      <ChatBox messages={messages} />
      <InputBox sendMessage={sendMessage} />
    </div>
  );
}

export default App;