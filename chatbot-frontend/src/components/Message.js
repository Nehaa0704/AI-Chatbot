import React from "react";

const Message = ({ message }) => {
  return (
    <div style={{ textAlign: message.role === "user" ? "right" : "left" }}>
      <p>
        <strong>{message.role}:</strong> {message.text}
      </p>
    </div>
  );
};

export default Message;