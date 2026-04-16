import React from "react";
import Message from "./Message";

const ChatBox = ({ messages }) => {
  return (
    <div style={{ height: "400px", overflowY: "scroll", border: "1px solid gray" }}>
      {messages.map((msg, index) => (
        <Message key={index} message={msg} />
      ))}
    </div>
  );
};

export default ChatBox;